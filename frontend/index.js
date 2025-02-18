import Canvas from "./src/canvas";
import Sidebar from "./src/sidebar";
import SettGenerator from "./src/sett-generator";

const settGenerator = new SettGenerator();
const canvas = new Canvas();
const sidebar = new Sidebar(canvas, settGenerator);

sidebar.loadSampleSett();
