
/*
 * aciTypewriter jQuery Plugin v1.0
 * http://acoderinsights.ro
 *
 * Copyright (c) 2012 Dragos Ursu
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Require jQuery Library http://jquery.com
 *
 * Date: Fri Dec 14 23:05 2012 +0200
 */

(function($){

    $.aciTypewriter = {
        nameSpace: '.aciTypewriter'
    };

    $.fn.aciTypewriter = function(options, data){
        var result = null;
        for (var i = 0; i < this.length; i++){
            result = $(this[i])._aciTypewriter(options, data);
            if (!(result instanceof jQuery)){
                return result;
            }
        }
        return this;
    };

    // default options
    $.fn.aciTypewriter.defaults = {
        words: true,                                    // if should work at a 'word' level (or character level when false)
        exclude: 'script',                              // exclude elements selector (need not to be empty)
        compounds: 'li:first,tr:first,table:first',     // compounds selector: elements like <li>, <table>, <tr> etc. you want to be hidden before start showing text inside them
        // need to work with .parents() (see :first added here)
        objects: 'img,br',                              // object selector: elements that you want to be hidden if the text before them it's not visible yet
        effects: true,                                  // use fadeIn effect? (the delay valus will be used as effect duration)
        textDelay: 10,                                  // delay until next piece of text is show
        fixDelay: true,                                 // if false and 'words' is true: the delay is computed based on word length
        compoundDelay: 50,                              // delay to show parent elements when the first piece of child text becomes visible
        // note: can add visible artefacts until becomes visible because the child also have running animation effects
        objectDelay: 200,                               // delay to show the next object
        dataEntry: 'twText',                            // the initial text is stored with this data key onto the changed dom elements
        autoInit: true,                                 // if autoInit is disabled need to manually init the typewriter
        autoStart: false,                               // if autoStart is disabled need to manually start the typewriter (if typewriter was not initialised this will do nothing)
        callbacks: {                                    // all callback functions receive a parameter: the current jquery object
            beforeInit: null,           // just before init
            afterInit: null,            // just after init (after dom changes)
            beforeStart: null,          // just before start
            afterFinish: null           // just after the end (dom changes where reverted already)
        }
    };

    $.fn._aciTypewriter = function(options, mixed){

        var $this = this;

        var data = this.data($.aciTypewriter.nameSpace);
        if (!data && ((typeof options == 'undefined') || (typeof options == 'object'))){
            data = {
                options: $.extend({}, $.fn.aciTypewriter.defaults, options),
                tickInterval: null,         // tick/tock :)
                wasInit: false,             // init state
                wasStart: false             // start state
            };
            this.data($.aciTypewriter.nameSpace, data);
        }

        // reset runtime data
        var _reset = function(){
            $.extend({}, data, {
                isPaused: false,            // paused state
                tickLast: null,             // tick cache/state
                tickText: null,
                tickLen: 0,
                tickIndex: 0,
                tickStart: 0,
                tockAll: null,              // tock cache/state
                tockLen: 0,
                tockIndex: 0
            });
        };

        // init text nodes
        var _textNode = function(element){
            var text = element.text();
            text = text.replace(/\s+/gm, ' ');
            if (text.length && (text != ' ')){
                if (data.options.compounds){
                    element.parents(data.options.compounds).addClass('typeWriter-parent').hide();
                }
                var replace = $('<' + 'span class="typeWriter"' + '>').data(data.options.dataEntry, text);
                element.replaceWith(replace);
            }
        }

        // init typewriter, change text nodes
        var _init = function(){
            if (data.wasInit){
                return;
            }
            data.wasInit = true;
            if (data.options.callbacks && data.options.callbacks.beforeInit){
                data.options.callbacks.beforeInit($this);
            }
            $this.contents().each(function(){
                if (typeof this.tagName == 'undefined') {
                    _textNode($(this));
                }
            });
            $this.find('*').not(data.options.exclude).each(function(){
                $(this).contents().each(function(){
                    if (typeof this.tagName == 'undefined') {
                        _textNode($(this));
                    }
                });
            });
            if (data.options.objects){
                $this.find(data.options.objects).addClass('typeWriter-hidden').hide();
            }
            if (data.options.callbacks && data.options.callbacks.afterInit){
                data.options.callbacks.afterInit($this);
            }
        };

        // start typewriter
        var _start = function(){
            if (!data.wasInit || data.wasStart){
                return;
            }
            data.wasStart = true;
            if (data.options.callbacks && data.options.callbacks.beforeStart){
                data.options.callbacks.beforeStart($this);
            }
            _reset();
            data.tickInterval = window.setTimeout(_tick, data.options.textDelay);
        };

        var _pause = function(){
            if (!data.wasInit || !data.wasStart){
                return;
            }
            data.isPaused = true;
        };

        var _resume = function(){
            if (!data.wasInit){
                return;
            }
            if (data.wasStart){
                if (data.isPaused){
                    data.isPaused = false;
                    data.tickInterval = window.setTimeout(_tick, data.options.textDelay);
                }
            } else {
                _start();
            }
        };

        // apply char or word fadeIn effect on show
        var _effect = function(parent, tickText, textDelay, callback){
            var element = $('<' + 'span class="typeWriter-item"' + '>').fadeTo(0, 0.1);
            element.text(tickText);
            parent.append(element);
            element.fadeTo(textDelay, 1, function(){
                var $this = $(this);
                $this.replaceWith($this.text());
                if (callback){
                    callback();
                }
                data.tickInterval = window.setTimeout(_tick, textDelay);
            });
        };

        // typewriter tick :)
        // handle text nodes and parent visibility
        var _tick = function(){
            window.clearTimeout(data.tickInterval);
            if (data.isPaused){
                return;
            }
            if (data.tickLast){
                var element = data.tickLast;
            } else {
                var element = data.tickLast = $this.find('.typeWriter:eq(0)');
                data.tickText = element.data(data.options.dataEntry) || '';
                data.tickIndex = 0;
                data.tickLen = data.tickText.length;
                if (data.options.objects){
                    data.tockAll = $this.find('*');
                    if (element.get(0)){
                        data.tockAll = data.tockAll.slice(0, data.tockAll.index(element)).filter('.typeWriter-hidden');
                    } else {
                        data.tockAll = data.tockAll.filter('.typeWriter-hidden');
                    }
                    data.tockLen = data.tockAll.length;
                    if (data.tockLen){
                        data.tockIndex = 0;
                        _tock();
                        return;
                    }
                }
            }
            if (element.get(0)){
                if (data.options.compounds){
                    element.parents('.typeWriter-parent').removeClass('typeWriter-parent').fadeIn(data.options.compoundDelay);
                }
                if (data.options.words){
                    // process word based typewriter
                    if (data.tickIndex < data.tickLen){
                        var pos = data.tickText.indexOf(' ', data.tickIndex);
                        if (pos == -1) {
                            data.tickLast.data(data.options.dataEntry, null);
                            data.tickLast = null;
                            if (data.options.effects){
                                _effect(element, data.tickText.substr(data.tickIndex), data.options.fixDelay ? data.options.textDelay : ((data.tickLen - data.tickIndex) * data.options.textDelay), function(){
                                    element.replaceWith(data.tickText);
                                });
                            } else {
                                element.replaceWith(data.tickText);
                                data.tickInterval = window.setTimeout(_tick, data.options.fixDelay ? data.options.textDelay : ((data.tickLen - data.tickIndex) * data.options.textDelay));
                            }
                        } else {
                            data.tickStart = data.tickIndex;
                            data.tickIndex = pos + 1;
                            if (data.options.effects){
                                _effect(element, data.tickText.substr(data.tickStart, data.tickIndex - data.tickStart), data.options.fixDelay ? data.options.textDelay : ((data.tickIndex - data.tickStart) * data.options.textDelay));
                            } else {
                                element.append(data.tickText.substr(data.tickStart, data.tickIndex - data.tickStart));
                                data.tickInterval = window.setTimeout(_tick, data.options.fixDelay ? data.options.textDelay : ((data.tickIndex - data.tickStart) * data.options.textDelay));
                            }
                        }
                    } else {
                        data.tickLast.data(data.options.dataEntry, null);
                        data.tickLast = null;
                        element.replaceWith(data.tickText);
                        data.tickInterval = window.setTimeout(_tick, data.options.textDelay);
                    }
                } else {
                    // process char based typewriter
                    if (data.tickIndex < data.tickLen){
                        data.tickStart = data.tickIndex;
                        data.tickIndex++;
                        if (data.options.effects){
                            _effect(element, data.tickText.substr(data.tickStart, 1), data.options.textDelay);
                        } else {
                            element.append(data.tickText.substr(data.tickStart, 1));
                            data.tickInterval = window.setTimeout(_tick, data.options.textDelay);
                        }
                    } else {
                        data.tickLast.data(data.options.dataEntry, null);
                        data.tickLast = null;
                        element.replaceWith(data.tickText);
                        data.tickInterval = window.setTimeout(_tick, data.options.textDelay);
                    }
                }
            } else {
                _finish();
            }
        }

        // typewriter tock :)
        // handle object elements
        var _tock = function(){
            window.clearTimeout(data.tickInterval);
            if (data.isPaused){
                return;
            }
            var element = data.tockAll.eq(data.tockIndex);
            data.tockIndex++;
            if (data.options.effects){
                element.removeClass('typeWriter-hidden').fadeIn(data.options.objectDelay, function(){
                    data.tickInterval = window.setTimeout(_tock, data.options.objectDelay);
                });
            } else {
                element.removeClass('typeWriter-hidden').show();
            }
            if (data.tockIndex > data.tockLen){
                data.tickInterval = window.setTimeout(_tick, data.options.textDelay);
            }
        };

        // called on typewriter finish
        var _finish = function(){
            data.wasStart = false;
            data.wasInit = false;
            if (data.options.callbacks && data.options.callbacks.afterFinish){
                data.options.callbacks.afterFinish($this);
            }
        };

        // stop and end typewriter
        // after this we need to init again before start
        var _stop = function(callback){
            if (!data.wasInit){
                return false;
            }
            _pause();
            window.setTimeout(function(){
                var saved = data.options;
                data.options.effects = false;
                data.options.textDelay = 0;
                data.options.fixDelay = true;
                data.options.compoundDelay = 0;
                data.options.objectDelay = 0;
                _resume();
                window.setTimeout(function(){
                    data.options = saved;
                    _finish();
                    if (callback){
                        callback($this);
                    }
                }, 50);
            }, Math.max(data.options.textDelay, options.compoundDelay, data.options.objectDelay));
            return true;
        };

        // init control based on options
        var _initUi = function(){
            if ((typeof options == 'undefined') || (typeof options == 'object')){
                _customUi();
            } else {
                // process custom request
                if (typeof options == 'string'){
                    switch (options){
                        case 'init':
                            // init dom (hide text and objects based on options)
                            // must init before we can run typewriter
                            _init();
                            break;
                        case 'start':
                            // start typewriter (only if was init first)
                            _start();
                            break;
                        case 'pause':
                            // pause typewriter (if started)
                            _pause();
                            break;
                        case 'resume':
                            // resume typewriter (only if was init, if not started it will start)
                            _resume();
                            break;
                        case 'finish':
                            // end typewriter (revert all dom when done, need to init again before start or resume)
                            _stop(mixed);
                            break;
                        case 'options':
                            // get options
                            return data.options;
                        case 'destroy':
                            // destroy the control
                            _destroyUi();
                            break;
                    }
                }
            }
            // return this object
            return $this;
        };

        // destroy control
        var _destroyUi = function(){
            if (data){
                if (!_stop(function(){
                    $this.data($.aciTypewriter.nameSpace, null);
                })){
                    $this.data($.aciTypewriter.nameSpace, null);
                }
            }
        };

        // init custom UI
        var _customUi = function(){

            if (data.options.autoInit){
                // auto init (init must be run before we can start typewriter)
                _init();
            }

            if (data.options.autoStart){
                // auto start typewriter (if init was run)
                _start();
            }

        };

        // init the control
        return _initUi();

    };

})(jQuery);
