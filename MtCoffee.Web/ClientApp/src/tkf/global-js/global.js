
//<editor-fold defaultstate="collapsed" desc="MOUSE DOWN + Hidden Focus">
// $(document).on('mousedown','a,button',function(e){
// 	$(this).addClass("x-hidden-focus");
// });

// $(document).on('blur','.x-hidden-focus',function(e){
// 	$(this).removeClass("x-hidden-focus");
// });

//</editor-fold>

//<editor-fold defaultstate="collapsed" desc="PREVIOUS AND CURRENT FOCUS">
// tkf.currFocus = document;
// $(window).on( 'focusin', function () {
//   var ncur = document.activeElement ?  document.querySelectorAll(':focus') : document.activeElement;
//   if (ncur !== null && ncur !== undefined){
// 	tkf.prevFocus = tkf.currFocus;
// 	tkf.currFocus = undefined == document.activeElement ? document.querySelectorAll(':focus') : document.activeElement;
//   }
// });
//</editor-fold>

//<editor-fold defaultstate="collapsed" desc="ON RESIZE">
// tkf.onResizeActions = [];
// $(window).ready(resizeCallback);
// $(window).resize(resizeCallback);
// var resizeTimeoutId = null;
// function resizeCallback() {
//     if (resizeTimeoutId)
//         window.clearTimeout(resizeTimeoutId);
//     resizeTimeoutId = window.setTimeout(tkf.doResizeActions, 5);
// }
// tkf.doResizeActions = function() {
//     for(var rai = 0; rai < tkf.onResizeActions.length; rai++){
//         tkf.onResizeActions[rai]();
//     }
// };
// tkf.onResize = function(func){
// 	tkf.onResizeActions.push(func);
// }
//</editor-fold>