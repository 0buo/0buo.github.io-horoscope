const ui_buttons = document.getElementById(`switchButtons`);
const ui_persp_div = document.getElementById(`ui-persp`)
const crumpled_uis = document.getElementsByClassName(`crumpled-ui`);


class MenuUI{
    constructor(){
        //this.ui_click_timer = undefined;
        this.ID_ui_disperse = undefined;
        this.ID_ui_flat = undefined;
        this.ID_ui_switch_img = undefined;

        this.ui_can_select = false;

        this.IDperspective = undefined;
        this.rx = 0;
        this.ry = 0;
        this.destRX = 0;
        this.destRY = 0;
        this.perspX = 50;
        this.perspY = 50;
        this.destPespX = 50;
        this.destPespY = 50;
        this.lastNOWpersp = undefined;

        this.ui_ids = [`ui1`, `ui2`, `ui3`, `ui4`, `ui5`, `ui6`, `ui7`];
    }

    ui_resize(){
        var vmin = window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth;
        var ui_dist = Math.min(Math.max(0.135 * vmin, 96), 160);
        ui_buttons.style.setProperty(`--ui-dist`, ui_dist + 'px');

        if(window.innerWidth < 770){
            cur_artist_name.classList.remove(`side`);
            cur_artist_name.classList.add(`under`);
        }
        else{
            cur_artist_name.classList.remove(`under`);
            cur_artist_name.classList.add(`side`);
        }
    }

    ui_disperse(){
        this.ID_ui_disperse = requestTimeout(function(){
            ui_is_dispersed = true;

            clearRequestTimeout(this.ID_ui_flat);
            this.ID_ui_flat = requestTimeout(function(){
                ui_persp_div.style.setProperty(`transform-style`, `preserve-3d`);
            }, 550);
            
            
            for (let i = 0; i < crumpled_uis.length; i++){
                let ui = crumpled_uis[i];
                ui.classList.remove(`gather`);
    
                var id = {value: parseInt(ui.getAttribute(`IDui-z`),10)};
                clearRequestTimeout(id);
                id = requestTimeout(function(){
                    if(!ui_is_dispersed){return;}
                    ui.style.setProperty(`--ui-z`, '5px');
    
                    this.ui_can_select = true;
                }.bind(this), 1000);
                ui.setAttribute(`IDui-z`, id.value);
            }

            if(window.innerWidth < 770){
                cur_artist_name.classList.add(`underaway`);
            }
            else{
                cur_artist_name.classList.add(`away`);
            }
            switchButton.style.setProperty(`display`, `none`);
            
        }.bind(this), 100);
    }

    ui_gather(){
        ui_is_dispersed = false;
        this.ui_can_select = false;
        clearRequestTimeout(this.ID_ui_disperse);
        

        clearRequestTimeout(this.ID_ui_flat);
        this.ID_ui_flat = requestTimeout(function(){
            ui_persp_div.style.setProperty(`transform-style`, `flat`);
        }, 550);
        

        for (let ui of crumpled_uis){
            ui.classList.remove(`quick-transition`);
            ui.classList.remove(`selected`);
            ui.classList.add(`gather`);
            
            var id = {value: parseInt(ui.getAttribute(`IDui-z`),10)};
            clearRequestTimeout(id);
            ui.style.setProperty(`--ui-z`, '30px');
            ui.style.setProperty(`z-index`, `0`);
        }
        cur_artist_name.classList.remove(`away`);
        cur_artist_name.classList.remove(`underaway`);
        switchButton.style.setProperty(`display`, `initial`);
    }

    ui_select(e){
        if(this.ui_can_select){
            e.target.classList.add(`quick-transition`);
            e.target.classList.add(`selected`);
            e.target.style.setProperty(`--ui-z`, '30px');
            e.target.style.setProperty(`z-index`, `2`);

            //switch img
            this.ID_ui_switch_img = requestTimeout(function(){
                if(getComputedStyle(e.target).getPropertyValue(`opacity`) > 0.92){
                    //switch imgs
                    var ui_index = this.ui_ids.indexOf(e.target.id) + 1;
                    global_img_index = ui_id_nums.indexOf(ui_index);
                    //change name
                    cur_artist_name.innerHTML = artist_names[global_img_index];
                }
            }.bind(this), 400);
        }
    }

    ui_deselect(e){
        if(this.ui_can_select){
            e.target.classList.remove(`selected`);
            e.target.style.setProperty(`--ui-z`, '5px');
            e.target.style.setProperty(`z-index`, `0`);
        }
    }

    ui_perpective(e){
        var ui_buttons_offset = {
            y: ui_buttons.offsetTop + ui_buttons.offsetHeight / 2,
            x: ui_buttons.offsetLeft + ui_buttons.offsetWidth / 2
        };
        
        var perspX = Math.min( ((ui_buttons_offset.x - e.pageX) / (window.innerWidth / 2) * 100 + 100) / 2, 100);
        var perspY = Math.min( ((ui_buttons_offset.y - e.pageY) / (window.innerHeight /2) * 100 + 100) / 2, 100);
        var max_r = 20;

        var rx = (ui_buttons_offset.y - e.pageY) / (window.innerHeight / 2) * max_r * 1.35;
        var ry = (- ui_buttons_offset.x + e.pageX) / (window.innerWidth / 2) * max_r * 1.35;

        rx = rx > max_r ? max_r
            :rx < -1 * max_r ? -1 * max_r
            :rx;
        ry = ry > max_r ? max_r
            :ry < -1 * max_r ? -1 * max_r
            :ry;

        this.destRX = rx;
        this.destRY = ry;
        this.destPespX = perspX;
        this.destPespY = perspY;
        
        this.IDperspective = requestAnimationFrame(this.ui_perspective_anim.bind(this));
    }

    ui_perspective_anim(timestamp){
        cancelAnimationFrame(this.IDperspective);
        this.IDperspective = requestAnimationFrame(this.ui_perspective_anim.bind(this));

        if(this.lastNOWpersp === undefined){
            this.lastNOWpersp = timestamp;
        }
        var NOW = timestamp;
        var dt = (NOW - this.lastNOWpersp)/1000;
        this.lastNOWpersp = NOW;

        this.rx = lerp(this.rx, this.destRX, 1-Math.pow(0.3, dt));
        this.ry = lerp(this.ry, this.destRY, 1-Math.pow(0.3, dt));
        this.perspX = lerp(this.perspX, this.destPespX, 1-Math.pow(0.25, dt));
        this.perspY = lerp(this.perspY, this.destPespY, 1-Math.pow(0.25, dt));

        ui_buttons.style.setProperty(`--ui-persp-x`, this.perspX + `%`);
        ui_buttons.style.setProperty(`--ui-persp-y`, this.perspY + `%`);
        ui_buttons.style.setProperty(`--ui-persp-r-x`, this.rx + `deg`);
        ui_buttons.style.setProperty(`--ui-persp-r-y`, this.ry + `deg`);
    }

    main(){
        this.ui_resize();
        window.addEventListener(`resize`, this.ui_resize.bind(this));

        if(!isMobile){
            switchButton.addEventListener(`mousedown`, this.ui_disperse.bind(this));
            window.addEventListener(`mouseup`, this.ui_gather.bind(this));
            window.addEventListener(`mousemove`, this.ui_perpective.bind(this));
            for (let ui of crumpled_uis){
                ui.addEventListener(`mouseover`, this.ui_select.bind(this));
                ui.addEventListener(`mouseleave`, this.ui_deselect.bind(this));
            }
        }
        else{
            switchButton.addEventListener(`touchstart`, this.ui_disperse.bind(this));
            // window.addEventListener(`touchend`, ui_gather);
        }
    }
}

const menu_ui = new MenuUI();
menu_ui.main();