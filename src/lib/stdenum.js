NECESSARIA_module.provide(['eisa.rt'], function(require){
require('eisa.rt').exec_(['stl', 'mod'], function (RUNTIME_$_,INIT_$_) {
var undefined;
var EISA_CNARG = RUNTIME_$_.CNARG;
var EISA_CREATERULE = RUNTIME_$_.CREATERULE;
var EISA_IINVOKE = RUNTIME_$_.IINVOKE;
var EISA_M_TOP = RUNTIME_$_.M_TOP;
var EISA_NamedArguments = RUNTIME_$_.NamedArguments;
var EISA_OBSTRUCTIVE = RUNTIME_$_.OBSTRUCTIVE;
var EISA_OBSTRUCTIVE_SCHEMATA_M = RUNTIME_$_.OBSTRUCTIVE_SCHEMATA_M;
var EISA_OWNS = RUNTIME_$_.OWNS;
var EISA_RETURNVALUE = RUNTIME_$_.RETURNVALUE;
var EISA_RMETHOD = RUNTIME_$_.RMETHOD;
var EISA_Rule = RUNTIME_$_.Rule;
var EISA_SLICE = RUNTIME_$_.SLICE;
var EISA_THROW = RUNTIME_$_.THROW;
var EISA_TRY = RUNTIME_$_.TRY;
var EISA_UNIQ = RUNTIME_$_.UNIQ;
var EISA_YIELDVALUE = RUNTIME_$_.YIELDVALUE;
return (function(){
    var _$_THIS = (this === EISA_M_TOP ? null : this);
    var enumerator_$=(INIT_$_.enumerator),
        module_$=(INIT_$_.module);
    ((module_$.declare)("stdenum", (function(require_$,exports_$){
        var down_$,
            downto_$,
            enum_$,
            select_$,
            takeWhile_$,
            up_$,
            upto_$;
        (enum_$=enumerator_$);
        (upto_$=(exports_$.upto = (enumerator_$(({build:function(SCHEMATA_$_){return function(m_$, n_$){
            var OBSTR1_$_, OBSTR2_$_, OBSTR3_$_, PROGRESS_$_, EOF_$_, COROFUN_$_;
            var i_$;
            PROGRESS_$_=1;
            EOF_$_= false;
            return COROFUN_$_ = function(){
                while(PROGRESS_$_)     MASTERCTRL: switch(PROGRESS_$_){
                      case 1:
                        (i_$=m_$);
                      case 2:
                        if(!((i_$<=n_$))){PROGRESS_$_=3; break MASTERCTRL};
                        OBSTR1_$_ = (enum_$);
                        OBSTR2_$_ = (i_$);
                        PROGRESS_$_=4;
                        return SCHEMATA_$_["break"](OBSTR1_$_.yield.call(OBSTR1_$_, OBSTR2_$_, function(x){OBSTR3_$_ = x; COROFUN_$_()}));
                      case 4:
                        OBSTR3_$_;
                        (i_$=(i_$+(1)));
                        {PROGRESS_$_=2; break MASTERCTRL};
                      case 3:
                        { PROGRESS_$_= 0;COROFUN_$_.stopped = true };;
                        return SCHEMATA_$_["return"]();
                    };
            };
        }}})))));
        (up_$=(exports_$.up = (enumerator_$(({build:function(SCHEMATA_$_){return function(n_$){
            var OBSTR1_$_, OBSTR2_$_, OBSTR3_$_, PROGRESS_$_, EOF_$_, COROFUN_$_;
            var i_$;
            PROGRESS_$_=1;
            EOF_$_= false;
            return COROFUN_$_ = function(){
                while(PROGRESS_$_)     MASTERCTRL: switch(PROGRESS_$_){
                      case 1:
                        (i_$=n_$);
                      case 2:
                        if(!(true)){PROGRESS_$_=3; break MASTERCTRL};
                        OBSTR1_$_ = (enum_$);
                        OBSTR2_$_ = (i_$);
                        PROGRESS_$_=4;
                        return SCHEMATA_$_["break"](OBSTR1_$_.yield.call(OBSTR1_$_, OBSTR2_$_, function(x){OBSTR3_$_ = x; COROFUN_$_()}));
                      case 4:
                        OBSTR3_$_;
                        (i_$=(i_$+(1)));
                        {PROGRESS_$_=2; break MASTERCTRL};
                      case 3:
                        { PROGRESS_$_= 0;COROFUN_$_.stopped = true };;
                        return SCHEMATA_$_["return"]();
                    };
            };
        }}})))));
        (downto_$=(exports_$.downto = (enumerator_$(({build:function(SCHEMATA_$_){return function(m_$, n_$){
            var OBSTR1_$_, OBSTR2_$_, OBSTR3_$_, PROGRESS_$_, EOF_$_, COROFUN_$_;
            var i_$;
            PROGRESS_$_=1;
            EOF_$_= false;
            return COROFUN_$_ = function(){
                while(PROGRESS_$_)     MASTERCTRL: switch(PROGRESS_$_){
                      case 1:
                        (i_$=m_$);
                      case 2:
                        if(!((i_$>=n_$))){PROGRESS_$_=3; break MASTERCTRL};
                        OBSTR1_$_ = (enum_$);
                        OBSTR2_$_ = (i_$);
                        PROGRESS_$_=4;
                        return SCHEMATA_$_["break"](OBSTR1_$_.yield.call(OBSTR1_$_, OBSTR2_$_, function(x){OBSTR3_$_ = x; COROFUN_$_()}));
                      case 4:
                        OBSTR3_$_;
                        (i_$=(i_$-(1)));
                        {PROGRESS_$_=2; break MASTERCTRL};
                      case 3:
                        { PROGRESS_$_= 0;COROFUN_$_.stopped = true };;
                        return SCHEMATA_$_["return"]();
                    };
            };
        }}})))));
        (down_$=(exports_$.down = (enumerator_$(({build:function(SCHEMATA_$_){return function(n_$){
            var OBSTR1_$_, OBSTR2_$_, OBSTR3_$_, PROGRESS_$_, EOF_$_, COROFUN_$_;
            var i_$;
            PROGRESS_$_=1;
            EOF_$_= false;
            return COROFUN_$_ = function(){
                while(PROGRESS_$_)     MASTERCTRL: switch(PROGRESS_$_){
                      case 1:
                        (i_$=n_$);
                      case 2:
                        if(!(true)){PROGRESS_$_=3; break MASTERCTRL};
                        OBSTR1_$_ = (enum_$);
                        OBSTR2_$_ = (i_$);
                        PROGRESS_$_=4;
                        return SCHEMATA_$_["break"](OBSTR1_$_.yield.call(OBSTR1_$_, OBSTR2_$_, function(x){OBSTR3_$_ = x; COROFUN_$_()}));
                      case 4:
                        OBSTR3_$_;
                        (i_$=(i_$-(1)));
                        {PROGRESS_$_=2; break MASTERCTRL};
                      case 3:
                        { PROGRESS_$_= 0;COROFUN_$_.stopped = true };;
                        return SCHEMATA_$_["return"]();
                    };
            };
        }}})))));
        (takeWhile_$=(exports_$.takeWhile = (enumerator_$(({build:function(SCHEMATA_$_){return function(I_$, condition_$){
            var ENUMERATOR1_$_, YV_$_, YVC_$_, OBSTR1_$_, OBSTR2_$_, OBSTR3_$_, PROGRESS_$_, EOF_$_, COROFUN_$_;
            var a_$;
            PROGRESS_$_=1;
            EOF_$_= false;
            return COROFUN_$_ = function(){
                while(PROGRESS_$_)     MASTERCTRL: switch(PROGRESS_$_){
                      case 1:
                        ENUMERATOR1_$_=I_$.getEnumerator();
                        (YVC_$_ = (YV_$_ = ENUMERATOR1_$_.emit()) instanceof EISA_YIELDVALUE) ? ( a_$=YV_$_.values ): undefined;
                      case 2:
                        if(!(YVC_$_)){PROGRESS_$_=3; break MASTERCTRL};
                        if(!((!(((condition_$.apply)(null, a_$)))))){PROGRESS_$_=4; break MASTERCTRL};
                        { PROGRESS_$_= 0;COROFUN_$_.stopped = true };;
                        return SCHEMATA_$_["return"](undefined);
                      case 4:
                        OBSTR1_$_ = (enum_$);
                        OBSTR2_$_ = (a_$);
                        PROGRESS_$_=6;
                        return SCHEMATA_$_["break"](OBSTR1_$_.bypass.call(OBSTR1_$_, OBSTR2_$_, function(x){OBSTR3_$_ = x; COROFUN_$_()}));
                      case 6:
                        OBSTR3_$_;
                        (YVC_$_ = (YV_$_ = ENUMERATOR1_$_.emit()) instanceof EISA_YIELDVALUE) ? ( a_$=YV_$_.values ): undefined;
                        {PROGRESS_$_=2; break MASTERCTRL};
                      case 3:
                        { PROGRESS_$_= 0;COROFUN_$_.stopped = true };;
                        return SCHEMATA_$_["return"]();
                    };
            };
        }}})))));
        (select_$=(exports_$.select = (enumerator_$(({build:function(SCHEMATA_$_){return function(I_$, condition_$){
            var ENUMERATOR1_$_, YV_$_, YVC_$_, OBSTR1_$_, OBSTR2_$_, OBSTR3_$_, PROGRESS_$_, EOF_$_, COROFUN_$_;
            var a_$;
            PROGRESS_$_=1;
            EOF_$_= false;
            return COROFUN_$_ = function(){
                while(PROGRESS_$_)     MASTERCTRL: switch(PROGRESS_$_){
                      case 1:
                        ENUMERATOR1_$_=I_$.getEnumerator();
                        (YVC_$_ = (YV_$_ = ENUMERATOR1_$_.emit()) instanceof EISA_YIELDVALUE) ? ( a_$=YV_$_.values ): undefined;
                      case 2:
                        if(!(YVC_$_)){PROGRESS_$_=3; break MASTERCTRL};
                        if(!(((condition_$.apply)(null, a_$)))){PROGRESS_$_=4; break MASTERCTRL};
                        OBSTR1_$_ = (enum_$);
                        OBSTR2_$_ = (a_$);
                        PROGRESS_$_=6;
                        return SCHEMATA_$_["break"](OBSTR1_$_.bypass.call(OBSTR1_$_, OBSTR2_$_, function(x){OBSTR3_$_ = x; COROFUN_$_()}));
                      case 6:
                        OBSTR3_$_;
                      case 4:
                        (YVC_$_ = (YV_$_ = ENUMERATOR1_$_.emit()) instanceof EISA_YIELDVALUE) ? ( a_$=YV_$_.values ): undefined;
                        {PROGRESS_$_=2; break MASTERCTRL};
                      case 3:
                        { PROGRESS_$_= 0;COROFUN_$_.stopped = true };;
                        return SCHEMATA_$_["return"]();
                    };
            };
        }}})))));
    })));
})
})
})
