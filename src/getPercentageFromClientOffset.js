function getPercentageFromClientOffset ({element, clientOffset}) {
  let {left, top, width, height} = element.getBoundingClientRect();
  let {scrollLeft, scrollTop} = document.documentElement;

  return {
    x: (clientOffset.x - left - scrollLeft) / width,
    y: (clientOffset.y - top - scrollTop) / height,
  };
}

export default getPercentageFromClientOffset;