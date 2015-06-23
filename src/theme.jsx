import Style from './Style';
import Color from 'color';

const bgColor = '#c4ecff';
const highlight = Color(bgColor).darken(0.4).desaturate(0.5).rotate(50).rgbaString();
const labelColor = Color(highlight).darken(0).rotate(0*1.618*180*0.333).rgbaString();

const theme = {
  color: 'black',
  bgColor: bgColor,
  highlight: highlight,
  labelColor: labelColor,
  dark: 'rgba(0,0,0,0.8)',
  fontFamily: 'Quicksand, sans-serif',
  mainPadding: 2,

  topBarHeight: 12,
  bottomBarHeight: 15,
};

theme.TOP_BAR = Style.registerStyle({
  fontSize: '4vmin',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  alignContent: 'center',
  width: '100vmin',
  padding: `${theme.mainPadding}vmin`,
  position: 'fixed',
  backgroundColor: Color(theme.bgColor).alpha(0.925).rgbString(),
  zIndex: 3,
  height: `${theme.topBarHeight}vmin`,
  top: 0,
  textTransform: 'uppercase',

  // HACK: Why do I have to do this?
  transform: 'translate3d(0,0,0)',
});

theme.BOTTOM_BAR = Style.registerStyle({
  fontSize: '4vmin',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  alignContent: 'center',
  width: '100vmin',
  padding: `${theme.mainPadding}vmin`,
  position: 'fixed',
  backgroundColor: Color(theme.bgColor).rgbString(),
  zIndex: 3,
  height: `${theme.bottomBarHeight}vmin`,
  bottom: 0,
  textTransform: 'uppercase',

  // HACK: Why do I have to do this?
  transform: 'translate3d(0,0,0)',
});

theme.WRAPPER = Style.registerStyle({
  width: '100vmin',
  minHeight: '100vh',
  margin: 'auto',
  backgroundColor: theme.bgColor,
});

theme.BUTTON = Style.registerStyle({
  fontFamily: theme.fontFamily,
  fontSize: '5vmin',
  border: 'none',
  outline: 'none',
  borderRadius: '1vmin',
  // padding: '1.5vmin 2vmin',
  padding: 0,
  fontWeight: 400,
  // color: 'white',
  color: theme.highlight,
  flexShrink: 0,
  height: '100%',
  marginLeft: `${theme.mainPadding}vmin`,
  // backgroundColor: theme.highlight,
  backgroundColor: 'transparent',
  cursor: 'pointer',
  textAlign: 'center',
  minWidth: '14vmin',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  alignContent: 'center',
  textTransform: 'uppercase',
});

export default theme;