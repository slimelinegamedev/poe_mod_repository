/* global Class, Spawnable */

(function (__undefined) {
    /**
     * Interface
     */
    this.Spawnable = Class.extend({
        init: function () {
            this.spawnweight_cached = 0;
            this.spawnchance = null;
            this.spawnable_byte = Spawnable.SUCCESS;
        },
        spawnableOn: function (mod_container) {
            
        },
        humanSpawnchance: function (precision) {
        },
        resetSpawnable: function () {
            
        },
        spawnableByteHuman: function () {
            
        },
        spawnableCached: function () {
            
        }
    });
    
    this.Spawnable.map = function (mod_collection, mod_container) {
        return $.map(mod_collection.slice(), function (mod) {
            if (Spawnable.implementedBy(mod)) {
                mod.spawnableOn(mod_container);
            }
            return mod;
        });
    };
    
    this.Spawnable.mods = function (mod_collection, mod_container, success) {
        return $.grep(mod_collection.slice(), function (mod) {
            return !Spawnable.implementedBy(mod) || mod.spawnableOn(mod_container, success);
        });
    };
    
    // interface pattern
    this.Spawnable.implementedBy = function (clazz) {
        return  clazz.spawnableOn !== __undefined;
    };
    
    /**
     * 
     * @param {Array<Spawnable>} spawnables
     * @param {Function} if_cb optional callback to filter mods
     * @returns {float}
     */
    this.Spawnable.calculateSpawnchance = function (spawnables, if_cb) {
        var sum_spawnweight = 0;
        if (typeof if_cb !== 'function') {
            if_cb  = function () { return true; };
        }
        
        $.each(spawnables, function (_, mod) {
            if (Spawnable.implementedBy(mod) && if_cb(mod)) {
                sum_spawnweight += mod.spawnweight;
            }
        });
        
        return $.map(spawnables, function (mod) {
            if (Spawnable.implementedBy(mod) && mod.spawnweight !== null && if_cb(mod)) {
                mod.spawnchance = mod.spawnweight / sum_spawnweight;
            }
            
            return mod;
        });
    };
    
    // Convention
    this.Spawnable.UNSCANNED = 0;
    this.Spawnable.SUCCESS = 1;
})();