EISA_eisa.using(['stl', 'mod'], function(vals, _enumerate){
(function(){
    var _$_THIS = (this === EISA_M_TOP ? null : this);
    var enumerator_$=(_$_THIS.enumerator),
        module_$=(_$_THIS.module);
    ((module_$.declare)(([]), (function(require_$,exports_$){
        var down_$,
            downto_$,
            select_$,
            takeWhile_$,
            up_$,
            upto_$;
        (upto_$=(exports_$.upto=(enumerator_$((EISA_OBSTRUCTIVE(function(SCHEMATA_$_){ return function(m_$, n_$){
            var _$_THIS = (this === EISA_M_TOP ? null : this);
            var _$_ARGS = EISA_SLICE(arguments, 0);
            var OBSTR1_$_, OBSTR2_$_, PROGRESS_$_, EOF_$_, ISFUN_$_, COROFUN_$_;
            var i_$;
            PROGRESS_$_=1;
            EOF_$_= false;
            return COROFUN_$_ = function(FUN_$_){
                ISFUN_$_ = typeof FUN_$_ === "function";
                while(PROGRESS_$_) {
                    MASTERCTRL: switch(PROGRESS_$_){
                      case 1:
                        (i_$=m_$);
                      case 2:
                        if(!((i_$<=n_$))){PROGRESS_$_=3; break MASTERCTRL};
                        OBSTR1_$_ = (i_$);
                        PROGRESS_$_=4;
                        return SCHEMATA_$_.yield(_$_THIS,_$_ARGS,[OBSTR1_$_],function(x){OBSTR2_$_ = x;COROFUN_$_() });
                      case 4:
                        OBSTR2_$_;
                        (i_$=(i_$+(1)));
                        {PROGRESS_$_=2; break MASTERCTRL};
                      case 3:
                        { PROGRESS_$_= 0;COROFUN_$_.stopped = true };;
                        return SCHEMATA_$_["return"](_$_THIS,_$_ARGS);
                    }
                };
            };
        }}))))));
        (up_$=(exports_$.up=(enumerator_$((EISA_OBSTRUCTIVE(function(SCHEMATA_$_){ return function(n_$){
            var _$_THIS = (this === EISA_M_TOP ? null : this);
            var _$_ARGS = EISA_SLICE(arguments, 0);
            var OBSTR1_$_, OBSTR2_$_, PROGRESS_$_, EOF_$_, ISFUN_$_, COROFUN_$_;
            var i_$;
            PROGRESS_$_=1;
            EOF_$_= false;
            return COROFUN_$_ = function(FUN_$_){
                ISFUN_$_ = typeof FUN_$_ === "function";
                while(PROGRESS_$_) {
                    MASTERCTRL: switch(PROGRESS_$_){
                      case 1:
                        (i_$=n_$);
                      case 2:
                        if(!(true)){PROGRESS_$_=3; break MASTERCTRL};
                        OBSTR1_$_ = (i_$);
                        PROGRESS_$_=4;
                        return SCHEMATA_$_.yield(_$_THIS,_$_ARGS,[OBSTR1_$_],function(x){OBSTR2_$_ = x;COROFUN_$_() });
                      case 4:
                        OBSTR2_$_;
                        (i_$=(i_$+(1)));
                        {PROGRESS_$_=2; break MASTERCTRL};
                      case 3:
                        { PROGRESS_$_= 0;COROFUN_$_.stopped = true };;
                        return SCHEMATA_$_["return"](_$_THIS,_$_ARGS);
                    }
                };
            };
        }}))))));
        (downto_$=(exports_$.downto=(enumerator_$((EISA_OBSTRUCTIVE(function(SCHEMATA_$_){ return function(m_$, n_$){
            var _$_THIS = (this === EISA_M_TOP ? null : this);
            var _$_ARGS = EISA_SLICE(arguments, 0);
            var OBSTR1_$_, OBSTR2_$_, PROGRESS_$_, EOF_$_, ISFUN_$_, COROFUN_$_;
            var i_$;
            PROGRESS_$_=1;
            EOF_$_= false;
            return COROFUN_$_ = function(FUN_$_){
                ISFUN_$_ = typeof FUN_$_ === "function";
                while(PROGRESS_$_) {
                    MASTERCTRL: switch(PROGRESS_$_){
                      case 1:
                        (i_$=m_$);
                      case 2:
                        if(!((i_$>=n_$))){PROGRESS_$_=3; break MASTERCTRL};
                        OBSTR1_$_ = (i_$);
                        PROGRESS_$_=4;
                        return SCHEMATA_$_.yield(_$_THIS,_$_ARGS,[OBSTR1_$_],function(x){OBSTR2_$_ = x;COROFUN_$_() });
                      case 4:
                        OBSTR2_$_;
                        (i_$=(i_$-(1)));
                        {PROGRESS_$_=2; break MASTERCTRL};
                      case 3:
                        { PROGRESS_$_= 0;COROFUN_$_.stopped = true };;
                        return SCHEMATA_$_["return"](_$_THIS,_$_ARGS);
                    }
                };
            };
        }}))))));
        (down_$=(exports_$.down=(enumerator_$((EISA_OBSTRUCTIVE(function(SCHEMATA_$_){ return function(n_$){
            var _$_THIS = (this === EISA_M_TOP ? null : this);
            var _$_ARGS = EISA_SLICE(arguments, 0);
            var OBSTR1_$_, OBSTR2_$_, PROGRESS_$_, EOF_$_, ISFUN_$_, COROFUN_$_;
            var i_$;
            PROGRESS_$_=1;
            EOF_$_= false;
            return COROFUN_$_ = function(FUN_$_){
                ISFUN_$_ = typeof FUN_$_ === "function";
                while(PROGRESS_$_) {
                    MASTERCTRL: switch(PROGRESS_$_){
                      case 1:
                        (i_$=n_$);
                      case 2:
                        if(!(true)){PROGRESS_$_=3; break MASTERCTRL};
                        OBSTR1_$_ = (i_$);
                        PROGRESS_$_=4;
                        return SCHEMATA_$_.yield(_$_THIS,_$_ARGS,[OBSTR1_$_],function(x){OBSTR2_$_ = x;COROFUN_$_() });
                      case 4:
                        OBSTR2_$_;
                        (i_$=(i_$-(1)));
                        {PROGRESS_$_=2; break MASTERCTRL};
                      case 3:
                        { PROGRESS_$_= 0;COROFUN_$_.stopped = true };;
                        return SCHEMATA_$_["return"](_$_THIS,_$_ARGS);
                    }
                };
            };
        }}))))));
        (takeWhile_$=(exports_$.takeWhile=(enumerator_$((EISA_OBSTRUCTIVE(function(SCHEMATA_$_){ return function(I_$, condition_$){
            var _$_THIS = (this === EISA_M_TOP ? null : this);
            var _$_ARGS = EISA_SLICE(arguments, 0);
            var ENUMERATOR1_$_, YV_$_, YVC_$_, OBSTR1_$_, OBSTR2_$_, PROGRESS_$_, EOF_$_, ISFUN_$_, COROFUN_$_;
            var a_$;
            PROGRESS_$_=1;
            EOF_$_= false;
            return COROFUN_$_ = function(FUN_$_){
                ISFUN_$_ = typeof FUN_$_ === "function";
                while(PROGRESS_$_) {
                    MASTERCTRL: switch(PROGRESS_$_){
                      case 1:
                        ENUMERATOR1_$_=I_$.getEnumerator();
                        (YV_$_=(ENUMERATOR1_$_).emit(),YVC_$_=YV_$_ instanceof EISA_YIELDVALUE,YVC_$_?(a_$=YV_$_.values):undefined);
                      case 2:
                        if(!(YVC_$_)){PROGRESS_$_=3; break MASTERCTRL};
                        if(!((!(((condition_$.apply)(null, a_$)))))){PROGRESS_$_=4; break MASTERCTRL};
                        { PROGRESS_$_= 0;COROFUN_$_.stopped = true };;
                        return SCHEMATA_$_["return"](_$_THIS,_$_ARGS,undefined);
                      case 4:
                        OBSTR1_$_ = (a_$);
                        PROGRESS_$_=6;
                        return SCHEMATA_$_.bypass(_$_THIS,_$_ARGS,[OBSTR1_$_],function(x){OBSTR2_$_ = x;COROFUN_$_() });
                      case 6:
                        OBSTR2_$_;
                        (YV_$_=(ENUMERATOR1_$_).emit(),YVC_$_=YV_$_ instanceof EISA_YIELDVALUE,YVC_$_?(a_$=YV_$_.values):undefined);
                        {PROGRESS_$_=2; break MASTERCTRL};
                      case 3:
                        { PROGRESS_$_= 0;COROFUN_$_.stopped = true };;
                        return SCHEMATA_$_["return"](_$_THIS,_$_ARGS);
                    }
                };
            };
        }}))))));
        (select_$=(exports_$.select=(enumerator_$((EISA_OBSTRUCTIVE(function(SCHEMATA_$_){ return function(I_$, condition_$){
            var _$_THIS = (this === EISA_M_TOP ? null : this);
            var _$_ARGS = EISA_SLICE(arguments, 0);
            var ENUMERATOR1_$_, YV_$_, YVC_$_, OBSTR1_$_, OBSTR2_$_, PROGRESS_$_, EOF_$_, ISFUN_$_, COROFUN_$_;
            var a_$;
            PROGRESS_$_=1;
            EOF_$_= false;
            return COROFUN_$_ = function(FUN_$_){
                ISFUN_$_ = typeof FUN_$_ === "function";
                while(PROGRESS_$_) {
                    MASTERCTRL: switch(PROGRESS_$_){
                      case 1:
                        ENUMERATOR1_$_=I_$.getEnumerator();
                        (YV_$_=(ENUMERATOR1_$_).emit(),YVC_$_=YV_$_ instanceof EISA_YIELDVALUE,YVC_$_?(a_$=YV_$_.values):undefined);
                      case 2:
                        if(!(YVC_$_)){PROGRESS_$_=3; break MASTERCTRL};
                        if(!(((condition_$.apply)(null, a_$)))){PROGRESS_$_=4; break MASTERCTRL};
                        OBSTR1_$_ = (a_$);
                        PROGRESS_$_=6;
                        return SCHEMATA_$_.bypass(_$_THIS,_$_ARGS,[OBSTR1_$_],function(x){OBSTR2_$_ = x;COROFUN_$_() });
                      case 6:
                        OBSTR2_$_;
                      case 4:
                        (YV_$_=(ENUMERATOR1_$_).emit(),YVC_$_=YV_$_ instanceof EISA_YIELDVALUE,YVC_$_?(a_$=YV_$_.values):undefined);
                        {PROGRESS_$_=2; break MASTERCTRL};
                      case 3:
                        { PROGRESS_$_= 0;COROFUN_$_.stopped = true };;
                        return SCHEMATA_$_["return"](_$_THIS,_$_ARGS);
                    }
                };
            };
        }}))))));
    })));
}).call(vals);
});
