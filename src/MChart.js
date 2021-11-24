import  {MCanvas} from './MCanvas.js';

export default class MChart {

    objects = [];
    constructor(container) {

        console.log("MChart container= ");
        console.log(container);
        this.container = container;
        mcanvas = new MCanvas(chart_container);
        console.log("MChart objects= ");
        console.log(objects);

    }
}