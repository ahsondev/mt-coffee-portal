// // ---------------  N A V B A R . J S  ------------------------------------------------------------
// // Navbar.js assumes there is only one c-navbar component on any given page. No more can be added.


// tkf.Components.Navbar = (function(){
// 	let component = {};
// 	component.isMobile = false;
// 	component.isInitialized = false;
	
// 	//<editor-fold defaultstate="collapsed" desc="Helpers">
// 	// ------  doInitialize()  --------------------------------------------------------------------
// 	// Initialize the nav menu and set up all ARIA states, and add any missing classes as needed.
// 	// Adds aria-expanded, aria-hidden, aria-haspopup, .f-nav-wrapper... adds helper classes to 
// 	// stylize links and buttons.  Also adds the c-navbar-fixed-spacer if the c-navbar has the
// 	// f-fixed modifier class.
// 	component.doInitialize = function(){
// 		$('.c-navbar').find('li,.f-nav-row').each(function(i,e){
// 			if ($(e).children("button").length > 0){
				
// 				// Navbar menu
// 				if ($(e).is('li')){
// 					if ($(e).hasClass('f-nav-menu') !== true){
// 						$(e).addClass("f-nav-menu");
// 					}
// 				}
// 				if ($(e).hasClass('f-nav-wrapper') !== true){
// 					$(e).addClass("f-nav-wrapper");
// 				}
				
// 				$(e) // Ensure correct ARIA rules.
// 				.children('button').attr('aria-expanded',($(e).children('button').attr('aria-expanded') === 'true'))
// 				.attr('aria-haspopup','true')
// 				.next('ul').attr('aria-hidden','true');
				
// 			} else if ($(e).children("a").length > 0) {
// 				if ($(e).hasClass('f-nav-link') !== true){
// 					$(e).addClass("f-nav-link");
// 				}
// 			}
// 		});
		
// 		$('.c-navbar .f-right').hide();
// 		$('.c-navbar .f-left').hide(); 
// 		// For f-fixed navbars, this is important.
// 		if ($('.c-navbar-fixed-spacer').length === 0 && $('.c-navbar.f-fixed').length !== 0){
// 			$('.c-navbar.f-fixed').after('<div class="c-navbar-fixed-spacer"></div>');
// 		}
// 		component.isInitialized = true;
// 		component.onResize();
// //		 //Make sure every menu element has an ID.
// //		$('.c-navbar').find('button,a,ul,li').each(function (i,e) {
// //			let tag = e.tagName;
// //			let depth = Math.floor($(e).parentsUntil('.c-navbar').length / 3);
// //			let sibIndex = -1;
// //			$(e).parent().children().each(function(ii,ee){
// //				if ($(ee).is(e)){
// //					sibIndex = ii;
// //				}
// //			});
// //			let yyy = Math.round($(e).offset().top / 49);
// //			let elemID = "y"+yyy+'_d'+depth+'_i'+sibIndex+'_'+tag+'-'+i;
// //			$(e).attr('id',elemID);
// //		});
// //		
// //		$('.c-navbar').find('button,a').each(function (i,e) {
// //			let elemID = $(e).text();
// //			$(e).attr('id',elemID);
// //		});
	
// 	};
	
	
// 	// -----  setMobileArrowsForCurrentSubmenu()  -------------------------------------------------
// 	// Toggles visibility of the mobile f-right and f-left arrows.
// 	component.setMobileArrowsForCurrentSubmenu = function(){
// 		let $curNav = $('.f-current-nav');
// 		if ($curNav.hasClass('f-nav-row')){
// 			if ($curNav.prev('.f-nav-row').length > 0){
// 				$('.c-navbar .f-left').show();
// 			}else{
// 				$('.c-navbar .f-left').hide();
// 			}
// 			if ($curNav.next('.f-nav-row').length > 0){
// 				$('.c-navbar .f-right').show();
// 			}else{
// 				$('.c-navbar .f-right').hide();
// 			}
// 		}else if ($curNav.parent().parent().is('.f-nav-wrapper')){
// 			$('.c-navbar .f-left').show();
// 			$('.c-navbar .f-right').hide();
// 		}
// 	};
	
	
// 	// -----  setTabIndexForCurrentSubmenu()  -----------------------------------------------------
// 	// Makes sure all other submenu elements have tabindex -1, and current elements have tabindex=0
// 	// This is for accessibility, and is only applied for the mobile version of the navbar.
// 	component.setTabIndexForCurrentSubmenu = function(navWrapElem){
// 		if (this.isMobile){ // Handle tab indexes
// 			$('.c-navbar .f-nav-row').find('button,a').attr('tabindex','-1');
// 			$('.c-navbar .f-current-nav > ul > li > *:not(ul)').attr('tabindex','0');
// 		}
// 	};
	
	
// 	// -------  onResize()  -----------------------------------------------------------------------
// 	// Handles setting of IsMobile, handles any changes between mobile and desktop that are needed.
// 	component.onResize = function(){
// 		if (tkf.Components.Navbar.isMobile === false){
// 			if ($(window).width() < 768){
// 				tkf.Components.Navbar.isMobile = true;
// 				$('.c-navbar').addClass('f-mobile');
// 				component.closeElementRecursive(); // Close the menu on state change.
// 			}
// 		}
// 		else if (tkf.Components.Navbar.isMobile === true){
// 			if ($(window).width() >= 768){
// 				tkf.Components.Navbar.isMobile = false;
// 				$('.c-navbar').removeClass('f-mobile');
// 				$('.f-nav-row a,.f-nav-row button').attr('tabindex','0');
// 				$('body').css('overflow-y','auto'); // Re-enable scrolling just in case
// 				component.closeElementRecursive(); // Close the menu on state change.
// 				// Ensure proper ARIA rules
// 				tkf.Components.Navbar.openElementRecursive($('.c-navbar .f-nav-row > button').first());
// 			}
// 		}

// 		// Make sure fixed navbar has a spacer
// 		if ($('.c-navbar.f-fixed + .c-navbar-fixed-spacer').length > 0){
// 			$('.c-navbar-fixed-spacer').height($('.c-navbar').height());
// 		}
// 	};
	
	
// 	// --------  isOffEdgeOfScreen(element)  ------------------------------------------------------
// 	// Returns true if element goes off the right edge of the screen.
// 	component.isOffEdgeOfScreen = function(element){
// 		let $e = $(element);
// 		let rightEdge = $e.width() + $e.offset().left;
// 		let screenWidth = $(window).width();
// 		return (rightEdge - screenWidth > 0);
// 	};
	
// 	// -----  hasTooManyVisibleElements()  --------------------------------------------------------
// 	// ONLY pass in a nav row. Returns true if there are too many visible elements in the row.
// 	component.hasTooManyVisibleElements = function(navRow){
// 		if (!!navRow && $(navRow).hasClass('f-nav-row')){
// 			if ($(navRow)[0].scrollHeight >  $(navRow)[0].innerHeight()) {
// 				return true;
// 			}
// 		}
// 		return false;
// 	};
	
// 	//</editor-fold>
	
// 	//<editor-fold defaultstate="collapsed" desc="Buttons / Controls">
	
// 	// ------  doToggleMobileMenu()  --------------------------------------------------------------
// 	// Open mobile menu if closed. Close if opened. Activates top level nav as the currently active
// 	// navigation submenu.
// 	component.doToggleMobileMenu = function(){
// 		$('.f-current-nav').removeClass('f-current-nav');
// 		let isExpanded = $('.c-navbar.f-opened').length > 0;
// 		if (isExpanded){
// 			$('.c-navbar').removeClass('f-opened');
// 			tkf.Components.Navbar.closeElementRecursive('.c-navbar');
// 			$('body').css('overflow-y','auto');
// 		}else{
// 			$('.c-navbar').addClass('f-opened');
// 			$('.c-navbar .f-nav-row').first().addClass('f-current-nav');
// 			tkf.Components.Navbar.openElementRecursive($('.c-navbar .f-nav-row > button').first());
// 			$('body').css('overflow-y','hidden');
// 			component.setMobileArrowsForCurrentSubmenu();
// 		}
// 	};
	

// 	// ------  doClick()  -------------------------------------------------------------------------
// 	// Click (Closed) --> Open submenu
// 	// if (Menu open will go off screen) then add "f-flip" class to the UL or something.
// 	// if mobile view... do other complex logic with back buttons and other things.
// 	// if (side by side with other submenu, set smaller so heights match bigger)
// 	component.doClick = function(element){
// 		if ($(element).is("li.f-nav-menu>button")){
// 			$e = $(element);
// 			if ($e.attr('aria-expanded') === 'false'){
// 				this.closeElementRecursive();
// 				this.openElementRecursive(element);
// 				if (this.isMobile){
// 					$(element).next('ul').children('li:first-child').children('a,button').addClass('x-hidden-focus').focus();
// 					component.setTabIndexForCurrentSubmenu();
// 				}
// 			}else if ($e.attr('aria-expanded') === 'true'){
// 				// Click (Opened) --> Close submenu and sub submenus.
// 				this.closeElementRecursive(element);
// 				$(element).closest('.f-nav-row').find('ul').height('');
// 			}
// 		}
// 	};
	
	
// 	// ------  doClickMobilePrevButton()  ---------------------------------------------------------
// 	// If sub menu, go UP one menu. If top level, try to go back one menu (There can be multiple
// 	// menu rows).
// 	component.doClickMobilePrevButton = function(){
// 		let curElem = $('.f-current-nav').removeClass('f-current-nav');
// 		let newElem = curElem;
// 		if (curElem.hasClass('f-nav-row')){
// 			newElem = curElem.prev('.f-nav-row'); // Go LEFT.
// 		}else{
// 			newElem = curElem.parent().parent(); // Go UP.
// 		}
// 		newElem.addClass('f-current-nav');
// 		component.closeElementRecursive(curElem.children('button'));
// 		component.openElementRecursive(newElem.children('button'));
// 		component.setMobileArrowsForCurrentSubmenu();
// 		component.setTabIndexForCurrentSubmenu();
// 	};
	
	
// 	// ------  doClickMobileNextButton()  ---------------------------------------------------------
// 	// Try to go forward one menu (There can be multiple menu rows).
// 	component.doClickMobileNextButton = function(){
// 		if ($('.f-current-nav').next('.f-nav-row').length > 0){
// 			let curElem = $('.f-current-nav').removeClass('f-current-nav');
// 			let newElem = $(curElem).next('.f-nav-row').addClass('f-current-nav');
// 			$('.f-mobile-title > span').text($(newElem).children('button').text());
// 			component.setMobileArrowsForCurrentSubmenu();
// 			component.setTabIndexForCurrentSubmenu();
// 		}
// 	};
	
	
// 	// ------  doShiftTab()  ----------------------------------------------------------------------
// 	// Really only works if coming from the keydown listener.
// 	component.doShiftTab = function(){
// 		if ($(tkf.currFocus).is($('.c-navbar button[aria-expanded="true"]'))) {
// 			tkf.Components.Navbar.closeElementRecursive($(tkf.currFocus));
// 		}
// 	};
	
	
// 	// ------  doTab()  ---------------------------------------------------------------------------
// 	// Really only works if coming from the keydown listener.
// 	component.doTab = function(){
// 		if (this.isMobile === true){
// 			// If going forward, and you hit the end of a list, don't go past the end of the list.
// 			if ($(tkf.currFocus).is('.c-navbar li:last-child > *:not(ul)')){
// 				$(tkf.prevFocus).focus();
// 			}
// 		}else{
// 			// If going forward, and you hit the end of a list, exit.
// 			// if end of list is expanded, go INTO the list instead of quitting. 
// 			if ($(tkf.currFocus).is($('.c-navbar li:last-child > *:not([aria-expanded="true"])'))){
// 				// figure out where to put the focus next.
// 				// Is parent's submenu expanded?
// 				if ($(tkf.currFocus).closest('ul').siblings('button').is('[aria-expanded="true"]')){
// 					tkf.Components.Navbar.closeElementRecursive($(tkf.currFocus).closest('ul').siblings('button'));

// 					if ($(tkf.currFocus).is('.c-navbar li:last-child li:last-child > *')){
// 						tkf.Components.Navbar.closeElementRecursive($(tkf.currFocus).closest('ul').parent().closest('ul').siblings('button'));

// 						if ($(tkf.currFocus).is('.c-navbar li:last-child li:last-child li:last-child > *')){
// 							tkf.Components.Navbar.closeElementRecursive($(tkf.currFocus).closest('ul').parent().closest('ul').parent().closest('ul').siblings('button'));
// 						}
// 					}
// 				}
// 			}
// 		}
// 	};
	
// 	component.doSlideNavRowLeft = function(navRow){
		
// 	};
// 	component.doSlideNavRowRight = function(navRow){
		
// 	};
	
// 	//</editor-fold>
	
// 	//<editor-fold defaultstate="collapsed" desc="Open / Close">
	
// 	// ------  closeElement()  --------------------------------------------------------------------
// 	// Close the specified element, but only if it is a button. Sets all ARIA states correctly. 
// 	// Removes custom heights that may be set using other JS functions. Also removes the f-flip mod.
// 	component.closeElement = function(element){
// 		if ($(element).is('button')){
// 			if (this.isMobile) 
// 			{
// 				$(element).attr('aria-expanded','false').next('ul').attr('aria-hidden','true');
// 			}
// 			else
// 			{
// 				$(element).attr('aria-expanded','false').next('ul').attr('aria-hidden','true')
// 				.css('height','').removeClass("f-flip")
// 				.parent().parent().css('height','');
// 			}
// 		}
// 	};
	
	
// 	// ------  closeElementRecursive()  -----------------------------------------------------------
// 	// Close all opened submenus. Reset submenu UL heights. If a selector is provided, then only
// 	// the submenus below the element will be closed.
// 	component.closeElementRecursive = function(selector){
// 		let self = this;
// 		if (!selector){ selector = '.c-navbar'; }
// 		self.closeElement(selector);
// 		$(selector).find('button[aria-expanded="true"]').each(function(i,e){
// 			self.closeElement(e);
// 		});
// 	};
		
	
// 	// ------  openElement()  ---------------------------------------------------------------------
// 	// Opens the current element, assuming the input is the button to be opened. Applies correct
// 	// ARIA states, and adds tabindexes as needed. Takes care of non mobile f-flips as well.
// 	component.openElement = function(element){
// 		if ($(element).is('button')){
// 			$(element).attr('aria-expanded','true').next('ul').attr('aria-hidden','false').removeClass("f-flip");
			
// 			if (this.isMobile === false){
// 				window.setTimeout(function(){ 
// 					// if (Menu open will go off screen) then add "f-flip" class to the UL or something.
// 					if (tkf.Components.Navbar.isOffEdgeOfScreen($(element).next('ul'))){
// 						$(element).next('ul').addClass("f-flip");
// 					}else{
// 						$(element).next('ul').removeClass("f-flip");
// 					}

// 					// if (side by side with other submenu, set smaller so heights match bigger)
// 					// We have to add a delay because otherwise our JS cant see the visible height of the new UL.
// 					if ($(element).next('ul').is(".f-nav-row > ul > li > ul > li > ul")){

// 							let m2 = $(element).parent().parent(); // button -> li -> UL
// 							let m3 = $(element).next('ul');
// 							let height = Math.max(m3.height(), m2.height());
// 							if (m2.height() < height){ m2.height(height);}
// 							if (m3.height() < height){ m3.height(height);}
// 					}
// 				}, 1);
// 			}
// 		} else {
// 			throw new Error("element must be a button.");
// 		}
// 	};

	
// 	// ------  openElementRecursive()  ------------------------------------------------------------
// 	// Opens current element, adds f-current-nav to the newly opened submenu, and makes sure any 
// 	// parent menus are also open.
// 	component.openElementRecursive = function(element){
// 		if ($(element).is("button")) {
// 			this.openElement(element);
// 			$('.c-navbar .f-current-nav').removeClass('f-current-nav');
// 			$(element).parent().addClass('f-current-nav');
// 			component.setMobileArrowsForCurrentSubmenu();
// 			$('.f-mobile-title > span').text($(element).text());
			
// 			if ($(element).parent().parent().is('ul')){
// 				element = $(element).parent().parent().siblings('button');
// 				this.openElement(element);
// 			}
// 		} else {
// 			throw new Error("element must be a button.");
// 		}
// 	};
	
// 	//</editor-fold>

// 	//<editor-fold defaultstate="collapsed" desc="Listeners">
// 	tkf.onResize(component.onResize);
	
// 	$(document).on("click",".c-navbar button",function(e){
// 		if (e.defaultPrevented) { return; }
			
// 		// Expand/ Close menu item
// 		if ($(e.target).is('li.f-nav-menu > button')){
// 			tkf.Components.Navbar.doClick(e.target);
// 		}else if ($(e.target).is('.f-header-toggle')){
// 			tkf.Components.Navbar.doToggleMobileMenu();
// 		}else if ($(e.target).is('.f-mobile-title > .f-left')){
// 			tkf.Components.Navbar.doClickMobilePrevButton();
// 		}else if ($(e.target).is('.f-mobile-title > .f-right')){
// 			tkf.Components.Navbar.doClickMobileNextButton();
// 		}
// 	});
	
// 	// Close NAV if clicking off the nav menu
// 	$(document).on('click','*',function(e){
// 		/* TODO: IF EXPERIENCING ISSUES, MAKE IT SO BELOW BLOCK RUNS EVERY TIME */
// 		let $exclude = $(e.target).closest('.f-nav-row');
// 		if ($exclude.length > 0 || $(tkf.prevFocus).closest('.f-nav-row').length > 0){
// 			$('.f-nav-row').each(function(i,ee){
// 				if ($(ee).is($exclude) === false){
// 					tkf.Components.Navbar.closeElementRecursive(ee);
// 				}
// 			});
// 		}
// 	});
	
// 	// Keydown happens before focusin, so we need to grab "current" focused item instead of "previously" 
// 	// focused item. It is a bit weird.
// 	$(document).on('keydown','.c-navbar', function (e) {
// 		if (e.defaultPrevented) { return; }
// 		let keyName = e.key.toLowerCase();
// 		let target = e.target;
// 		let isShifted = e.shiftKey;
// 		switch (keyName) {
// 			case "space":
// 				e.preventDefault();
// 				tkf.Components.Navbar.doClick(tkf.currFocus);
// 				break;
// 			case "enter":
// 				break;
// 			case "tab":
// 				if (isShifted === false) tkf.Components.Navbar.doTab();
// 				else tkf.Components.Navbar.doShiftTab();
// 				break;
// 			case "escape":
// 				tkf.Components.Navbar.closeElementRecursive();
// 				break;
// 			default:
// 				break;
// 		}
// 	});
	
// 	$(document).ready(function(){
// 		tkf.Components.Navbar.doInitialize();
// 	});
// 	//</editor-fold>
	
// 	return component;
// }());
