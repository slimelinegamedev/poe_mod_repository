(function (__undefined) {
    var ModGenerator = require('./ModGenerator');
    var Transmute = require('./Transmute');
    var Vaal = require('./Vaal');
    var Talisman = require('./Talisman');
    var Item = require('../ModContainers/Item');
    var Mod = require('../mods/Mod');
    var ApplicableMod = require('../mods/ApplicableMod');
    var RollableMod = require('../mods/RollableMod');
    var MasterMod = require('../mods/MasterMod');
    var Spawnable = require('../Spawnable');
    
    /**
     * class ItemShowcase extends ModGenerator
     * 
     * Masterbench/Currency hybrid
     */
    var ItemShowcase = ModGenerator.extend({
        /**
         * 
         * @param {Array} all_mods
         * @returns {ItemShowcase}
         */
        init: function (all_mods) {
            var mods = $.map(all_mods, function (mod) {
                // transmute/vaal mods
                if (!Transmute.mod_filter(mod) && 
                        !Vaal.mod_filter(mod) &&
                        !Talisman.mod_filter(mod)) {
                    return null;
                }
                
                if (+mod.GenerationType === Mod.MOD_TYPE.TALISMAN) {
                    return new ApplicableMod(mod);
                }
                
                if (+mod.Domain === Mod.DOMAIN.MASTER) {
                    // mastermod? => look for craftingbench
                    var craftingbenchoption = $.map(MasterMod.craftingbenchoptions, function (option) {
                        if (+option.ModsKey === +mod.Rows) {
                            return option;
                        }
                        return null;
                    })[0];
                    
                    if (!craftingbenchoption) {
                        // most likely legacy
                        //console.log("could not find craftingbenchoption for ", +mod['Rows'], mod);
                        return null;
                    }
                          
                    return new MasterMod(mod, craftingbenchoption);
                }
                
                // spawnable?
                if (mod.SpawnWeight_TagsKeys !== "") {
                    return new RollableMod(mod);
                }
                
                return null;
            });
            
            this._super(mods, ApplicableMod);
            
            //console.log(this.getAvailableMods());
        },
        /**
         * only abstract showcase, not for actual usage
         * 
         * @param {ModContainer} mod_container
         * @returns {Boolean}
         */
        applyTo: function (mod_container) {
            return false;
        },
        /**
         * maps mod::applicableTo and (if implemented) mod::spawnableOn 
         * if we have all the space for mods we need
         * 
         * @param {Item} baseitem
         * @param {byte} success whitelist
         * @returns {Array}
         */
        map: function (baseitem, success) {
            // simulate showcase
            var old_rarity = baseitem.rarity;
            baseitem.rarity = Item.RARITY.SHOWCASE;
            
            var mods = $.map(this.getAvailableMods(), function (mod) {
                mod.applicableTo(baseitem, success);
                
                if (Spawnable.implementedBy(mod)) {
                    mod.spawnableOn(baseitem, success);
                }
                
                // vaals replace so we dont care about full or not
                if (mod.isType("vaal")) {
                    mod.applicable_byte.disable('DOMAIN_FULL');
                }
                
                return mod;
            });
            
            baseitem.rarity = old_rarity;
            return mods;
        },
        /**
         * greps mod::applicableTo and (if implemented) mod::spawnableOn 
         * if we have all the space for mods we need
         * 
         * @param {Item} baseitem
         * @param {byte} success whitelist
         * @returns {Array}
         */
        mods: function (baseitem, success) {
            // simulate showcase
            var old_rarity = baseitem.rarity;
            baseitem.rarity = Item.RARITY.SHOWCASE;
            
            var mods = $.map(this.getAvailableMods(), function (mod) {
                if (mod.applicableTo(baseitem, success) && 
                        (!Spawnable.implementedBy(mod) || mod.spawnableOn(baseitem))) {
                    // vaals replace so we dont care about full or not
                    if (mod.isType("vaal")) {
                        mod.applicable_byte.disable('DOMAIN_FULL');
                    }
                    
                    return mod;
                }
                return null;
            });
            
            baseitem.rarity = old_rarity;
            return mods;
        },
        name: function () {
            return "Item Showcase";
        }
    });
    
    module.exports = ItemShowcase;
}).call(this);