Template.landingpage.events({
    'submit #Register-form': function(event){
        event.preventDefault();
        var RegName = document.getElementById('name').value;
        var RegEmail = document.getElementById('regemail').value;
        var password = document.getElementById('password1').value;
        var Role = document.getElementById('role').value;
        Accounts.createUser({
            email: RegEmail,
            password: password,
            profile: {
                name: RegName,
                role: Role,
            }
        }, function(error) {
            if(error)
            {
                console.log(error.reason);
            }
            else {
                if(Role == 0) {
                    FlowRouter.go("/manager");
                }
                else if(Role == 1) {
                    FlowRouter.go("/floorplan");
                }
                else if(Role == 2){
                    FlowRouter.go("/orderqueue")
                }
                else if(Role == 3){
                    FlowRouter.go("/waiter")
                }
                else if(Role == 4){
                    FlowRouter.go("/floorplan")
                }
                else {
                    console.log(error.reason);
                }
            }
        });


    },
    'submit #login-form': function(event){
        event.preventDefault();
        var LoginEmail = document.getElementById('loginEmail').value;
        var LoginPassword = document.getElementById('loginPassword').value;
        Meteor.loginWithPassword(LoginEmail, LoginPassword,function(error){
            if(error){
                console.log(error.reason);
            } else {
                var currentUser = Meteor.userId();
                console.log(currentUser.profile);
                if(Meteor.user().profile.role == 0) {
                    FlowRouter.go("/manager");
                }
                else if(Meteor.user().profile.role == 1) {
                    FlowRouter.go("/floorplan");
                }
                else if(Meteor.user().profile.role == 2){
                    FlowRouter.go("/orderqueue")
                }
                else if(Meteor.user().profile.role == 3){
                    FlowRouter.go("/waiter")
                }
                else if(Meteor.user().profile.role == 4){
                    FlowRouter.go("/floorplan")
                }
                else {
                    console.log(error.reason);
                }
            }
        });
    }
});
