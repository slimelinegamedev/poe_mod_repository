/* global Mod, MetaData */

(function (__undefined) {
    /*
     * Item Class
     * deprecated
     */
    this.Item = ModContainer.extend({
        init: function (props) {
            if (Item.meta_data === null) {
                console.log("pls init meta data");
                return null;
            }
            
            this._super();
            
            // default
            this.rarity = Item.RARITY.NORMAL;
            this.item_level = Item.MAX_ILVL;
            this.random_name = "";
            
            // parse entry
            this.entry = new GgpkEntry(props);
            
            // get meta data key
            // path.split(/[\\/]/).pop() := basename 
            var clazz = this.entry.getProp("InheritsFrom").split(/[\\/]/).pop();
            
            // meta data exists?
            this.meta_data = MetaData.build(clazz, Item.meta_data);
        },
        addMod: function (mod) {
            if (!(mod instanceof Mod)) {
                return false;
            }
            
            if (mod.isPrefix() && this.prefixes().length < this.maxPrefixes()
                || mod.isSuffix() && this.suffixes().length < this.maxSuffixes()
                || mod.isImplicit() && this.implicits().length < this.maxImplicits()
            ) {
                return this._super(mod);
            }
            return false;
        },
        removeMod: function (mod) {
            return this._super(mod);
        },
        addTag: function (tag_key) {
            if (this.tags.indexOf(tag_key) === -1) {
                this.tags.push(tag_key);
                return true;
            }
            return false;
        },
        removeTag: function (tag_key) {
            var index = this.tags.indexOf(tag_key);
            if (index !== -1) {
                this.tags = this.tags.splice(index, 1);
                return tag_key;
            }
            return false;
        },
        /**
         * returns tags of item + tags from mods
         * @returns {Array}
         */
        getTags: function () {
            return $.unique(this._super().concat(this.meta_data.props.tags, this.entry.valueAsArray("TagsKeys")));
        },
        maxModsOfType: function (mod) {
            var generation_type = +mod.getProp("GenerationType");
            
            switch (generation_type) {
                case Mod.MOD_TYPE.PREFIX:
                    return this.maxPrefixes();
                case Mod.MOD_TYPE.SUFFIX:
                    return this.maxSuffixes();
                case Mod.MOD_TYPE.IMPLICIT:
                    return this.maxImplicits();
            }
            
            return -1;
        },
        maxPrefixes: function () {
            switch (this.rarity) {
                case Item.RARITY.NORMAL:
                    return 0;
                case Item.RARITY.MAGIC:
                    return 1;
                case Item.RARITY.RARE:
                case Item.RARITY.SHOWCASE:
                    if (this.meta_data.isA("AbstractJewel")) {
                        return 2;
                    }
                    return 3;
                case Item.RARITY.UNIQUE:
                    return Number.POSITIVE_INFINITY;
            }
        },
        maxSuffixes: function () {
            return this.maxPrefixes();
        },
        maxImplicits: function () {
            return 1;
        },
        modDomainEquiv: function () {
            if (this.meta_data.isA("AbstractJewel")) {
                return Mod.DOMAIN.JEWEL;
            }
            if (this.meta_data.isA("AbstractFlask")) {
                return Mod.DOMAIN.FLASK;
            }
            if (this.meta_data.isA("AbstractMap")) {
                return Mod.DOMAIN.MAP;
            }
            return Mod.DOMAIN.ITEM;
        },
        inDomainOf: function (mod_domain) {
            switch (mod_domain) {
                case Mod.DOMAIN.MASTER:
                    return this.inDomainOf(Mod.DOMAIN.ITEM);
                default:
                    return mod_domain === this.modDomainEquiv();
            }
        },
        base_name: function () {
            return this.entry.getProp("Name");
        },
        name: function () {
            switch (this.rarity) {
                case Item.RARITY.MAGIC:
                    var name = "";
                    // prefix
                    if (this.prefixes().length) {
                        name += this.prefixes()[0].getProp("Name") + " ";
                    }
                    // + base_name
                    name += this.base_name();
                    // + suffix
                    if (this.suffixes().length) {
                        name += " " + this.suffixes()[0].getProp("Name");
                    }
                    
                    return name;
                case Item.RARITY.RARE:
                    return "Random Name + " + this.base_name();
                default: 
                    return this.base_name();
            }
        },
        primary: function () {
            return +this.entry.getProp("Rows");
        },
        requirements: function () {
            return {
                level: this.entry.getProp("DropLevel")
            };
        }
    });
    
    this.Item.meta_data = null;
    
    this.Item.RARITY = {
        NORMAL: 1,
        MAGIC: 2,
        RARE: 3,
        UNIQUE: 4,
        SHOWCASE: 5
    };
    
    this.Item.MAX_ILVL = 100;
    
    /* tags are obsolte. they are derivated from the inheritance chain
     * they are kept for historic reasons */
    this.Item.ITEMCLASSES = {
        AMULET: {
            PRIMARY: 5, 
            // amulet, default
            TAGS: [3, 0]
        },
        RING: {
            PRIMARY: 6, 
            // ring, default
            TAGS: [2, 0]
        },
        CLAW: {
            PRIMARY: 7, 
            // claw, onehandweapon, weapon
            TAGS: [14, 81, 8]
        },
        DAGGER: { 
            PRIMARY: 8, 
            // dagger, onehandweapon, weapon
            TAGS: [13, 81, 8]
        },
        WAND: { 
            PRIMARY: 9, 
            // wand, onehandweapon, weapon, ranged
            TAGS: [9, 81, 8, 32]
        },
        SWORD_1H: { 
            PRIMARY: 10, 
            // sword, onehandweapon, weapon
            TAGS: [12, 81, 8]
        },
        THRUSTING_SWORD_1H: {
            PRIMARY: 11, 
            // sword, onehandweapon, weapon
            TAGS: [12, 81, 8]
        },
        AXE_1H: {
            PRIMARY: 12, 
            // axe, onehandweapon, weapon
            TAGS: [15, 81, 8]
        },
        MACE_1H: { 
            PRIMARY: 13, 
            // mace, onehandweapon, weapon
            TAGS: [11, 81, 8]
        },
        BOW: {
            PRIMARY: 14,
            // bow, twohandweapon, weapon, ranged
            TAGS: [5, 82, 8, 32]
        },
        STAFF: { 
            PRIMARY: 15, 
            // Staff, twohandweapon, weapon
            TAGS: [10, 82, 8]
        },
        SWORD_2H: { 
            PRIMARY: 16, 
            // sword, twohandweapon, weapon
            TAGS: [12, 82, 8]
        },
        AXE_2H: { 
            PRIMARY: 17, 
            // axe, twohandweapon, weapon
            TAGS: [15, 82, 8]
        },
        MACE_2H: {
            PRIMARY: 18, 
            // mace, twohandweapon, weapon
            TAGS: [11, 82, 8]
        },
        QUIVER: {
            PRIMARY: 21, 
            // quiver, default
            TAGS: [21, 0]
        },
        BELT: {
            PRIMARY: 22, 
            // belt, default
            TAGS: [26, 0]
        },
        GLOVES: {
            PRIMARY: 23, 
            // gloves, armour, default
            TAGS: [22, 7, 0]
        },
        BOOTS: {
            PRIMARY: 24, 
            // boots, armour, default
            TAGS: [4, 7, 0]
        },
        ARMOUR: {
            PRIMARY: 25, 
            // body_armour, armour, default
            TAGS: [16, 7, 0]
        },
        HELMET: {
            PRIMARY: 26, 
            // helmet, armour, default
            TAGS: [25, 7, 0]
        },
        SHIELD: { 
            PRIMARY: 27, 
            // shield, armour, default
            TAGS: [1, 7, 0]
        },
        SCEPTRE: {
            PRIMARY: 33, 
            // sceptre, onehandweapon, weapon
            TAGS: [37, 81, 8]
        },
        MAP: {
            PRIMARY: 36, 
            // default
            TAGS: [0]
        },
        FISHING_ROD: {
            PRIMARY: 38, 
            // fishing_rod
            TAGS: [80]
        },
        MAP_FRAGMENT: { 
            PRIMARY: 39,
            TAGS: []
        },
        JEWEL: {
            PRIMARY: 42, 
            // default
            TAGS: [0]
        }
    };
})();

