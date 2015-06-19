import Color from 'color';

const bgColor = '#c4ecff';
const highlight = Color(bgColor).darken(0.15).rotate(50).rgbaString();
const labelColor = Color(highlight).darken(0).rotate(0*1.618*180*0.333).rgbaString();

export default {
  color: 'black',
  bgColor: bgColor,
  highlight: highlight,
  fontFamily: 'Quicksand, sans-serif',
  labelColor: labelColor,
  mainPadding: 2,
};