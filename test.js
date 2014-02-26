var data = {
    "id": "test-form",
    "action": "test-save.php",
    "method": "POST",
    "data": {
        "column1": {
            "type": "fieldset",
            "data": {
                "state": {
                    "type": "select",
                    "name": "state",
                    "label": "State",
                    "placeholder": "Select a State",
                    "options": {
                        "CA": "California",
                        "TX": "Texas",
                        "UT": "Utah",
                        "NV": "Nevada"
                    }
                },
                "campaign": {
                    "type": "select",
                    "model": "campaigns",
                    "name": "campaign",
                    "label": "Campaign",
                    "placeholder": "Select a Campaign",
                    "disabled": true
                }
            }
        },
        "column2": {
            "type": "fieldset",
            "data": {
                "agent": {
                    "type": "select",
                    "model": "agents",
                    "name": "agent",
                    "placeholder": "Select an Agent",
                    "disabled": true,
                    "label": "Agent"
                },
                "agent_type": {
                    "type": "select",
                    "name": "agent_type",
                    "label": "Agent Type",
                    "placeholder": "Select an Agent Type",
                    "options": {
                        "rookie": "Rookie",
                        "veteran": "Veteran"
                    },
                    "disabled": true
                }

            }
        },
        "column3": {
            "type": "fieldset",
            "data": {
                "campaign_type": {
                    "type": "select",
                    "name": "campaign_type",
                    "placeholder": "Select the type of campaign",
                    "label": "Campaign Type",
                    "disabled": true,
                    "options": {
                        "local_2": "2 week local campaign",
                        "road_1": "1 week driving campaign",
                        "road_2": "2 week driving campaign",
                        "air_2": "2 week flying campaign",
                        "air_3": "3 week flying campaign"
                    }
                },
                "start": {
                    "type": "date",
                    "label": "Start Date",
                    "name": "start",
                    "disabled": true
                }

            }
        }
    }
}

$(document).ready(function(){
    var form = new Napkin.form.Controller('#', data, $("#form-container"));
    form.render();
    console.log(form.form.children);
});