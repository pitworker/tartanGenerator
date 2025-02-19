import Canvas from "./components/canvas";
import Sidebar from "./components/sidebar";
import SettGenerator from "./components/sett-generator";

const settGenerator = new SettGenerator();
const canvas = new Canvas();
const sidebar = new Sidebar(canvas, settGenerator);

sidebar.loadSampleSett();
