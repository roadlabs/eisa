NECESSARIA_module.provide(['eisa.rt'], function(){
arguments[0]('eisa.rt').exec_(['stl', 'mod'], function(){
    var _$_THIS = (this === EISA_M_TOP ? null : this);
    var undefined;
    var EISA_CNARG = _$_THIS.runtime.CNARG;
    var EISA_CREATERULE = _$_THIS.runtime.CREATERULE;
    var EISA_IINVOKE = _$_THIS.runtime.IINVOKE;
    var EISA_M_TOP = _$_THIS.runtime.M_TOP;
    var EISA_NamedArguments = _$_THIS.runtime.NamedArguments;
    var EISA_OBSTRUCTIVE = _$_THIS.runtime.OBSTRUCTIVE;
    var EISA_OBSTRUCTIVE_SCHEMATA_M = _$_THIS.runtime.OBSTRUCTIVE_SCHEMATA_M;
    var EISA_OWNS = _$_THIS.runtime.OWNS;
    var EISA_RETURNVALUE = _$_THIS.runtime.RETURNVALUE;
    var EISA_RMETHOD = _$_THIS.runtime.RMETHOD;
    var EISA_Rule = _$_THIS.runtime.Rule;
    var EISA_SLICE = _$_THIS.runtime.SLICE;
    var EISA_THROW = _$_THIS.runtime.THROW;
    var EISA_TRY = _$_THIS.runtime.TRY;
    var EISA_UNIQ = _$_THIS.runtime.UNIQ;
    var EISA_YIELDVALUE = _$_THIS.runtime.YIELDVALUE;
    var enumerator_$=((_$_THIS.inits).enumerator),
        module_$=((_$_THIS.inits).module);
    ((module_$.declare)("stdenum", (function(require_$,exports_$){
        var down_$,
            downto_$,
            select_$,
            takeWhile_$,
            up_$,
            upto_$;
        (upto_$=(exports_$.upto = (enumerator_$((EISA_OBSTRUCTIVE(function(SCHEMATA_$_){return function(m_$, n_$){
            var OBSTR1_$_, OBSTR2_$_, PROGRESS_$_, EOF_$_, ISFUN_$_, COROFUN_$_;
            var i_$;
            PROGRESS_$_=1;
            EOF_$_= false;
            return COROFUN_$_ = function(FUN_$_){
                ISFUN_$_ = typeof FUN_$_ === "function";
                while(PROGRESS_$_){
                    MASTERCTRL: switch(PROGRESS_$_){
                      case 1:
                        (i_$=m_$);
                      case 2:
                        if(!((i_$<=n_$))){PROGRESS_$_=3; break MASTERCTRL};
                        OBSTR1_$_ = (i_$);
                        PROGRESS_$_=4;
                        return SCHEMATA_$_.yield(OBSTR1_$_, function(x){OBSTR2_$_ = x; COROFUN_$_()});
                      case 4:
                        OBSTR2_$_;
                        (i_$=(i_$+(1)));
                        {PROGRESS_$_=2; break MASTERCTRL};
                      case 3:
                        { PROGRESS_$_= 0;COROFUN_$_.stopped = true };;
                        return SCHEMATA_$_["return"]();
                    }
                };
            };
        }}))))));
        (up_$=(exports_$.up = (enumerator_$((EISA_OBSTRUCTIVE(function(SCHEMATA_$_){return function(n_$){
            var OBSTR1_$_, OBSTR2_$_, PROGRESS_$_, EOF_$_, ISFUN_$_, COROFUN_$_;
            var i_$;
            PROGRESS_$_=1;
            EOF_$_= false;
            return COROFUN_$_ = function(FUN_$_){
                ISFUN_$_ = typeof FUN_$_ === "function";
                while(PROGRESS_$_){
                    MASTERCTRL: switch(PROGRESS_$_){
                      case 1:
                        (i_$=n_$);
                      case 2:
                        if(!(true)){PROGRESS_$_=3; break MASTERCTRL};
                        OBSTR1_$_ = (i_$);
                        PROGRESS_$_=4;
                        return SCHEMATA_$_.yield(OBSTR1_$_, function(x){OBSTR2_$_ = x; COROFUN_$_()});
                      case 4:
                        OBSTR2_$_;
                        (i_$=(i_$+(1)));
                        {PROGRESS_$_=2; break MASTERCTRL};
                      case 3:
                        { PROGRESS_$_= 0;COROFUN_$_.stopped = true };;
                        return SCHEMATA_$_["return"]();
                    }
                };
            };
        }}))))));
        (downto_$=(exports_$.downto = (enumerator_$((EISA_OBSTRUCTIVE(function(SCHEMATA_$_){return function(m_$, n_$){
            var OBSTR1_$_, OBSTR2_$_, PROGRESS_$_, EOF_$_, ISFUN_$_, COROFUN_$_;
            var i_$;
            PROGRESS_$_=1;
            EOF_$_= false;
            return COROFUN_$_ = function(FUN_$_){
                ISFUN_$_ = typeof FUN_$_ === "function";
                while(PROGRESS_$_){
                    MASTERCTRL: switch(PROGRESS_$_){
                      case 1:
                        (i_$=m_$);
                      case 2:
                        if(!((i_$>=n_$))){PROGRESS_$_=3; break MASTERCTRL};
                        OBSTR1_$_ = (i_$);
                        PROGRESS_$_=4;
                        return SCHEMATA_$_.yield(OBSTR1_$_, function(x){OBSTR2_$_ = x; COROFUN_$_()});
                      case 4:
                        OBSTR2_$_;
                        (i_$=(i_$-(1)));
                        {PROGRESS_$_=2; break MASTERCTRL};
                      case 3:
                        { PROGRESS_$_= 0;COROFUN_$_.stopped = true };;
                        return SCHEMATA_$_["return"]();
                    }
                };
            };
        }}))))));
        (down_$=(exports_$.down = (enumerator_$((EISA_OBSTRUCTIVE(function(SCHEMATA_$_){return function(n_$){
            var OBSTR1_$_, OBSTR2_$_, PROGRESS_$_, EOF_$_, ISFUN_$_, COROFUN_$_;
            var i_$;
            PROGRESS_$_=1;
            EOF_$_= false;
            return COROFUN_$_ = function(FUN_$_){
                ISFUN_$_ = typeof FUN_$_ === "function";
                while(PROGRESS_$_){
                    MASTERCTRL: switch(PROGRESS_$_){
                      case 1:
                        (i_$=n_$);
                      case 2:
                        if(!(true)){PROGRESS_$_=3; break MASTERCTRL};
                        OBSTR1_$_ = (i_$);
                        PROGRESS_$_=4;
                        return SCHEMATA_$_.yield(OBSTR1_$_, function(x){OBSTR2_$_ = x; COROFUN_$_()});
                      case 4:
                        OBSTR2_$_;
                        (i_$=(i_$-(1)));
                        {PROGRESS_$_=2; break MASTERCTRL};
                      case 3:
                        { PROGRESS_$_= 0;COROFUN_$_.stopped = true };;
                        return SCHEMATA_$_["return"]();
                    }
                };
            };
        }}))))));
        (takeWhile_$=(exports_$.takeWhile = (enumerator_$((EISA_OBSTRUCTIVE(function(SCHEMATA_$_){return function(I_$, condition_$){
            var ENUMERATOR1_$_, YV_$_, YVC_$_, OBSTR1_$_, OBSTR2_$_, OBSTR3_$_, PROGRESS_$_, EOF_$_, ISFUN_$_, COROFUN_$_;
            var a_$;
            PROGRESS_$_=1;
            EOF_$_= false;
            return COROFUN_$_ = function(FUN_$_){
                ISFUN_$_ = typeof FUN_$_ === "function";
                while(PROGRESS_$_){
                    MASTERCTRL: switch(PROGRESS_$_){
                      case 1:
                        ENUMERATOR1_$_=I_$.getEnumerator();
                        (YVC_$_ = (YV_$_ = ENUMERATOR1_$_.emit()) instanceof EISA_YIELDVALUE) ? ( a_$=YV_$_.values ): undefined;
                      case 2:
                        if(!(YVC_$_)){PROGRESS_$_=3; break MASTERCTRL};
                        if(!((!(((condition_$.apply)(null, a_$)))))){PROGRESS_$_=4; break MASTERCTRL};
                        { PROGRESS_$_= 0;COROFUN_$_.stopped = true };;
                        return SCHEMATA_$_["return"](undefined);
                      case 4:
                        OBSTR1_$_ = (enumerator_$);
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
                    }
                };
            };
        }}))))));
        (select_$=(exports_$.select = (enumerator_$((EISA_OBSTRUCTIVE(function(SCHEMATA_$_){return function(I_$, condition_$){
            var ENUMERATOR1_$_, YV_$_, YVC_$_, OBSTR1_$_, OBSTR2_$_, OBSTR3_$_, PROGRESS_$_, EOF_$_, ISFUN_$_, COROFUN_$_;
            var a_$;
            PROGRESS_$_=1;
            EOF_$_= false;
            return COROFUN_$_ = function(FUN_$_){
                ISFUN_$_ = typeof FUN_$_ === "function";
                while(PROGRESS_$_){
                    MASTERCTRL: switch(PROGRESS_$_){
                      case 1:
                        ENUMERATOR1_$_=I_$.getEnumerator();
                        (YVC_$_ = (YV_$_ = ENUMERATOR1_$_.emit()) instanceof EISA_YIELDVALUE) ? ( a_$=YV_$_.values ): undefined;
                      case 2:
                        if(!(YVC_$_)){PROGRESS_$_=3; break MASTERCTRL};
                        if(!(((condition_$.apply)(null, a_$)))){PROGRESS_$_=4; break MASTERCTRL};
                        OBSTR1_$_ = (enumerator_$);
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
                    }
                };
            };
        }}))))));
    })));
});
});
