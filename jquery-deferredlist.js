/*
The "New" BSD License:
**********************

Copyright (c) 2005-2009, The Dojo Foundation
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.
  * Neither the name of the Dojo Foundation nor the names of its contributors
    may be used to endorse or promote products derived from this software
    without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*
this is direct port of Dojo's DeferredList to jQuery.

by: Siegmund Führinger - http://sifu.io/ - http://twitter.com/0xx0
*/

(function(){

    jQuery.DeferredList = function(/*Array*/ list, /*Boolean?*/ fireOnOneCallback, /*Boolean?*/ fireOnOneErrback, /*Boolean?*/ consumeErrors, /*Function?*/ canceller){
        // summary:
        //		Provides event handling for a group of Deferred objects.
        // description:
        //		DeferredList takes an array of existing deferreds and returns a new deferred of its own
        //		this new deferred will typically have its callback fired when all of the deferreds in
        //		the given list have fired their own deferreds.  The parameters `fireOnOneCallback` and
        //		fireOnOneErrback, will fire before all the deferreds as appropriate
        //
        //	list:
        //		The list of deferreds to be synchronizied with this DeferredList
        //	fireOnOneCallback:
        //		Will cause the DeferredLists callback to be fired as soon as any
        //		of the deferreds in its list have been fired instead of waiting until
        //		the entire list has finished
        //	fireonOneErrback:
        //		Will cause the errback to fire upon any of the deferreds errback
        //	canceller:
        //		A deferred canceller function, see jQuery.Deferred
        var resultList = [];
        jQuery.Deferred.call(this);
        var self = this;
        if(list.length === 0 && !fireOnOneCallback){
            this.resolve([0, []]);
        }
        var finished = 0;
        jQuery.each(list, function(i, item){
            item.then(function(result){
                if(fireOnOneCallback){
                    self.resolve([i, result]);
                }else{
                    addResult(true, result);
                }
            },function(error){
                if(fireOnOneErrback){
                    self.reject(error);
                }else{
                    addResult(false, error);
                }
                if(consumeErrors){
                    return null;
                }
                throw error;
            });
            function addResult(succeeded, result){
                resultList[i] = [succeeded, result];
                finished++;
                if(finished === list.length){
                    self.resolve(resultList);
                }
                
            }
        });
    };
    jQuery.DeferredList.prototype = new jQuery.Deferred();

    jQuery.DeferredList.prototype.gatherResults= function(deferredList){
        // summary:	
        //	Gathers the results of the deferreds for packaging
        //	as the parameters to the Deferred Lists' callback

        var d = new jQuery.DeferredList(deferredList, false, true, false);
        d.addCallback(function(results){
            var ret = [];
            jQuery.each(results, function(i, result){
                ret.push(result[1]);
            });
            return ret;
        });
        return d;
    };
})();
