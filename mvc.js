var Napkin = Napkin || {};

(function(N){
    if (!N.Class){
        return;
    }


    var ModelInterface = new N.Interface('Model', ['update']);
    var ViewInterface = new N.Interface('View', ['update, display']);
    var ControllerInterface = new N.Interface('Controller', ['save']);



    /* Model class */
    var Model = N.Class.extend(function(value){
            this.value = value;
        })
            .method('update', function(value){
                this.value = value
            })
        ;

    /* View class */
    var View = N.Class.extend(function(controller){
            N.Interface.ensureImplements(N.interfaces.Model);
            this.controller = controller;
        })
            .method('update', function(){

            })
        ;

    /* Controller class */
    var Controller = N.Class.extend(function(){

    });

    N.Model = Model;
    N.View = View;
    N.Controller = Controller;



    N.interfaces.Model = ModelInterface;
    N.interfaces.View = ViewInterface;
    N.interfaces.Controller = ControllerInterface;


})(Napkin);
