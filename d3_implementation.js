import * as d3 from "d3"

function init()
{
    d3.select('body').html("Width: " + screen.width.toString() + "\n" + "Height: " + screen.height.toString())
}