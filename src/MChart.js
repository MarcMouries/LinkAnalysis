//import  {MCanvas} from './MCanvas.js';

export default class MChart {

    constructor(container) {

        console.log("MChart container= ");
        console.log(container);
        this.container = container;

        this.objects = [];

       // mcanvas = new MCanvas(chart_container);
       this.canvas = document.getElementById("canvas");
       this.ctx = canvas.getContext("2d");

    }
    dump() {
        console.log("MChart container= ");
        console.log("- objects= ");
        console.log(this.objects);

    }

    addObject(object) {
        this.objects.push(object);
        this.draw();
    }

    draw() {
        console.log("draw draw= ");

        
        this.objects.forEach((object) => object.render(this.ctx));
    }
}
