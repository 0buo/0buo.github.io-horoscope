class GenerateSimilar{
    constructor(canvas_id=`test-canvas`){
        this.canvas = document.getElementById(canvas_id);
        this.continueStep = false;
        this.stepValue = 0.025;
    }

    async find(dcgan_url, photo_url, photo_w, photo_h){
        this.mobile_net; 
        await this.loadMobileNet();
        this.dcgan; 
        await this.loadDcgan(dcgan_url);

        this.photo = new Image(photo_w, photo_h);
        this.photo.addEventListener(`load`, this.main.bind(this));
        this.photo.src = photo_url;
    }

    async main(){
        const photo_tensor = tf.browser.fromPixels(this.photo);
        this.photo_tensor_data = photo_tensor.dataSync();
        this.photo_feature = await this.extractFeature(photo_tensor);
        
        console.log(`got original photo features`);
        tf.dispose(photo_tensor);
        
        
        await this.findSimilar();
        tf.disposeVariables();
    }

    //===========
    //LOAD MODELS
    async loadMobileNet(){
        this.mobile_net = await mobilenet.load(2, 1);
        console.log('mobilenet loaded');
    }

    async loadDcgan(url){
        this.dcgan = await tf.loadGraphModel(url);
        console.log('dcgan loaded');
    }

    //==============
    //EXECUTE MODELS
    async generateImage(z=undefined){
        const [img, ] = tf.tidy(function(){
            if(z === undefined){
                z = tf.randomUniform([1, 512], -1, 1, 'float32', Date.now());
            }
            let img = this.dcgan.execute(z);
            img = tf.squeeze(img, 0);
            //CHANGE SHAPE HERE IF OUTPUT DIFFERENT SIZE
            img = tf.add(img, tf.fill([256,256,3],1));
            img = tf.mul(img, tf.fill([256,256,3],0.5));

            return [img, z];
        }.bind(this));


        await tf.browser.toPixels(img, this.canvas);
        const temp_img_tensor = tf.browser.fromPixels(this.canvas);

        tf.dispose(img);
        
        this.gen_img_tensor_shape = temp_img_tensor.shape;
        const img_tensor = temp_img_tensor.dataSync();
        const latency = z.dataSync();
        tf.dispose([temp_img_tensor, z]);

        return [img_tensor, latency];
    }

    async extractFeature(image_input){
        let temp_result = tf.tidy(function(){return this.mobile_net.infer(image_input, true);}.bind(this)); 
        // tf.dispose(classes);
        this.feature_shape = temp_result.shape;
        const result = temp_result.dataSync();
        tf.dispose([image_input, temp_result]);
        return result;
    }

    //============
    //FIND SIMILAR
    async tryOnce(z=undefined, returnLatency=true){
        const [generated_img_data, latency] = await this.generateImage(z);
        let temp_generated_img_tensor = tf.tensor(generated_img_data, this.gen_img_tensor_shape);

        const gen_feature_data = await this.extractFeature(temp_generated_img_tensor).catch(err => {console.error(`${err} \n${err.stack}`)});
        tf.dispose(temp_generated_img_tensor);

        let temp_gen_feature = tf.tensor(gen_feature_data, this.feature_shape);
        let temp_photo_features = tf.tensor(this.photo_feature, this.feature_shape);
        let diff = tf.sub(temp_gen_feature, temp_photo_features);
        tf.dispose([temp_photo_features, temp_gen_feature]);

        let temp = tf.sum(tf.mul(diff, diff));
        let dist = temp.dataSync()[0];
        // dist = Math.sqrt(dist);
        if(!returnLatency) tf.dispose(latency);
        tf.dispose([diff, temp, gen_feature_data]);
        return [dist, latency];
    } 

    async getLatentDirectionFromRandom(){
        console.log(`start with radom Zs`);
    
        this.close_list = [];
        this.far_list = [];
        for(let i = 0; i < 30; i++){
            let ii = 0;
            let close = {dist: Infinity, latency: undefined};
            let far = {dist: -Infinity, latency: undefined};
            while (ii <= 60){
                let [dist, latency] = await this.tryOnce().catch(err => {console.error(`${err} \n${err.stack}`)});
                if(dist < close.dist) {
                    close.dist = dist; 
                    close.latency = latency;
                }
                else if(dist > far.dist && dist < 700){
                    far.dist = dist;
                    far.latency = latency;
                }
                tf.dispose([dist, latency]);
                ii++;
            }
            let temp_z = tf.tensor(close.latency, [1, 512]);
            await this.generateImage(temp_z, false);
            tf.dispose(temp_z)

            this.close_list.push(close);
            this.far_list.push(far);
            console.log(tf.memory());
        }
        console.log(`finished gen from random`)
    }

    async onestep(idx){
        //move z in direction dir
        let temp_z = tf.tensor(this.start_z, [1,512]);
        const temp_dir = tf.clipByValue(tf.tensor(this.dir[idx], [1, 512]), -1, 1);
        temp_z = tf.add(temp_dir, temp_z);
        let cur_z = temp_z.dataSync();
        tf.dispose(temp_dir);

        let [dist, l] = await this.tryOnce(temp_z, false).catch(err => {console.error(`ERROR stepping: ${err}`)});
        tf.dispose([l, temp_z]);

        console.log(`${idx}:  cur_dist: ${this.cur_dist}; \ndist: ${dist}`)
        console.log(cur_z[0]);
        

        if(dist < this.cur_dist) {
            this.cur_dist = dist;
            this.start_z = cur_z;
            this.continueStep = true;
        }
        else if(dist >= this.cur_dist && idx < this.dir.length - 1){
            idx += 1;
            this.continueStep = true;
        }
        else {this.continueStep = false;}
        
        tf.disposeVariables();
        return idx;
    }

    async stepping(){
        console.log(`start stepping...`)
        let idx = 0;

        this.canvas = document.createElement(`canvas`);
        document.body.append(this.canvas);
        while (this.continueStep){
            idx = await this.onestep(idx);
            console.log(tf.memory());  
        }

        let temp_final_z = tf.tensor(this.start_z, [1, 512]);
        await this.generateImage(temp_final_z);
        tf.dispose(temp_final_z);
        console.log(`finished`);
    }

    async getMeanWithPhoto(){
        let finals = [];
        this.final_images_z.forEach((z,i) =>{
            let temp_f_z = tf.tensor(z, [1, 512]);
            finals[i] = temp_f_z;
            // tf.dispose(temp_f_z);
        });
        
        let final_mean_z = tf.mean( tf.stack(finals, 0), 0, false ).mul(tf.tensor([1]));
        this.canvas = document.getElementById(`test-canvas`);
        await this.generateImage(final_mean_z);

        final_mean_z = tf.mean( tf.stack(finals, 0), 0, false ).mul(tf.tensor([2]));
        this.canvas = document.getElementById(`test-canvas2`);
        const [img_tensor, l] = await this.generateImage(final_mean_z);
        tf.dispose([final_mean_z, finals, l]);

        // let mean_img = tf.add(tf.tensor(img_tensor, this.gen_img_tensor_shape).mul(tf.tensor([3])),
        //                       tf.tensor(this.photo_tensor_data, this.gen_img_tensor_shape));
        // mean_img = mean_img.div(tf.tensor([4])).div(tf.tensor([255]));
        // await tf.browser.toPixels(mean_img, this.canvas);
        // tf.dispose(mean_img);
    }
    

    async findSimilar(){
        await this.getLatentDirectionFromRandom().catch(err => {console.error(`ERROR getting direction from random gen: ${err} \n${err.stack}`)})
        
        //get average direction    
        let temp_dir = [];
        this.close_list.forEach((c, idx)=>{
            let temp_c_l = tf.tensor(c.latency, [1,512]);
            let temp_f_l = tf.tensor(this.far_list[idx].latency, [1,512]);
            temp_dir.push( tf.sub(temp_c_l, temp_f_l).mul(tf.tensor(this.stepValue)).dataSync() ) ;
            tf.dispose([temp_c_l, temp_f_l]);
        });  
        tf.dispose(this.far_list);
        
        //get closest start
        this.close_list.forEach((c, i) => {
            c.index = i;
        });
        this.close_list.sort(function(a,b){return a.dist-b.dist;});
        this.dir = [];
        this.close_list.forEach((c, i)=>{
            this.dir[i] = temp_dir[c.index];
        });

        this.cur_dist_list = [];
        this.start_z_list = [];
        this.close_list.forEach(c => {
            this.cur_dist_list.push(c.dist);
            this.start_z_list.push(c.latency);
        });
        tf.dispose([this.close_list, temp_dir]);

        

        // tf.dispose([this.close_list, close_dist]);

        // console.log(this.start_z);
        // console.log(this.cur_dist);

        console.log(tf.memory());

        tf.disposeVariables();
        // setTimeout(async function(){
            this.final_images_z = [];
            for(let i = 0; i < this.start_z_list.length; i++){
                this.continueStep = true;
                this.cur_dist = this.cur_dist_list[i];
                this.start_z = this.start_z_list[i];
                this.final_images_z[i] = this.start_z;

                await this.stepping();
            }
            await this.getMeanWithPhoto();
        // }.bind(this), 1000);
    }
}

window.onload = async()=>{
    const DCGAN_URL = 'model/genFace256/model.json';
    const Gen = new GenerateSimilar();
    await Gen.find(DCGAN_URL,`./imgs/test7.jpeg`, 256, 256);
}