const MODEL_URL = 'model/genFace256/model.json';

async function main(){
    const canvas = document.getElementById(`test-canvas`)

    const model = await tf.loadGraphModel(MODEL_URL);
    console.log('model loaded');

    img = model.execute(tf.fill([1, 512],1));
    img = tf.squeeze(img, 0);
    img = tf.add(img, tf.fill([256,256,3],1));
    img = tf.mul(img, tf.fill([256,256,3],0.5));
    console.log(img.shape)
    tf.browser.toPixels(img, canvas);
}

main();
