Qualtrics.SurveyEngine.addOnload(function()
{
    /*Place your JavaScript here to run when the page loads*/

   /* Change 1: Hiding the Next button */
    // Retrieve Qualtrics object and save in qthis
    var qthis = this;

    // Hide buttons
    qthis.hideNextButton();

    /* Change 2: Defining and load required resources */
    var task_github = "https://lamju229.github.io/digit-span-task/"; // https://<your-github-username>.github.io/<your-experiment-name>

    // requiredResources must include all the JS files that demo-simple-rt-task-transformed.html uses.
    var requiredResources = [
	    
	task_github + "jspsych-6.0.4/jspsych.js",
    	task_github + "jspsych-6.0.4/plugins/jspsych-html-keyboard-response.js",
    	task_github + "jspsych-6.0.4/plugins/jspsych-digit-span-recall.js",
    	task_github + "jspsych-6.0.4/plugins/jspsych-survey-text.js",
    	task_github + "jspsych-6.0.4/plugins/jspsych-instructions.js",
    	task_github + "jspsych-6.0.4/plugins/jspsych-fullscreen.js",
    	"https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js",
    	"https://cdn.jsdelivr.net/npm/jstat@latest/dist/jstat.min.js"

    ];

    function loadScript(idx) {
        console.log("Loading ", requiredResources[idx]);
        jQuery.getScript(requiredResources[idx], function () {
            if ((idx + 1) < requiredResources.length) {
                loadScript(idx + 1);
            } else {
                initExp();
            }
        });
    }

    if (window.Qualtrics && (!window.frameElement || window.frameElement.id !== "mobile-preview-view")) {
        loadScript(0);
    }

    /* Change 3: Appending the display_stage Div using jQuery */
    // jQuery is loaded in Qualtrics by default
    jQuery("<div id = 'display_stage_background'></div>").appendTo('body');
    jQuery("<div id = 'display_stage'></div>").appendTo('body');

    /* Change 4: Wrapping jsPsych.init() in a function */
    function initExp() {

  nTrials = 14 // number of trials in the test
  minSetSize = 3 // starting digit length
  stimuli_duration = 1000 // number of miliseconds to display each digit
  recall_duration = null // number of miliseconds to allow recall. If null, there is no time limit.
  file_name = null // file name for data file. if null, a default name consisting of the participant ID and a unique number is chosen.
  local = true // save the data file locally.
              // If this test is being run online (e.g., on MTurk), true will cause the file to be downloaded to the participant's computer.
              // If this test is on a server, and you wish to save the data file to that server, change this to false.
              // If changed to false, ensure that the php file (its in the directory!) and the empty "data" folder has also been appropriately uploaded to the server.
              // Incase of problems, feel free to contact me :)

//----------------------------------------------------------------------

  possibleNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]  //possible digits participants can get

  var selection = jsPsych.randomization.sampleWithoutReplacement(possibleNumbers, minSetSize)  //chooses random digits
  var selection_id = -1

  // keeps track of participant's scores:
  var nError = 0
  var highest_span_score = 0
  var consec_error_score = 0

  // first page. identifies participant for data storage
  var p_details = {
    type:"survey-text",
    questions: [{prompt: "Enter participant number, name, or ID"}],
    on_finish:function(){
      partN = jsPsych.data.get().last(1).values()[0].partNum
      partN = partN.replace(/['"]+/g,'')
//      console.log(partN[0])
    }
  }

// instruction page
var instructions = {
    type: 'instructions',
    pages: function(){
      pageOne = "<div style='font-size:20px;'><b>INSTRUCTIONS</b><br><br>This is the digit span task.<br><br>In this task, you will have to remember a sequence of numbers presented on the screen one after the other.<br>At the end of each trial, enter all the numbers into the onscreen number-pad in their correct order.<br><br><u>Example:</u> if the sequence is '7 4 5 1', enter '7 4 5 1' in this exact order.<br><br>You will now be given practice trials to help you understand the task.<br>Press 'Next' to start the practice trials.<br><br></div>"
      return [pageOne]
    },
    allow_backward: false,
    button_label_next: "Next",
    show_clickable_nav: true
  }

  var instructions_node = {
      type: 'instructions',
      pages: function(){
        pageOne = "<div style='font-size:20px;'>You have completed the practice trials. <br><br> If you have further questions about the task, ask the researcher now.<br> If you are clear about the task, click 'Next' to proceed to the main trials.<br><br></div>"
        return [pageOne]
      },
      allow_backward: false,
      button_label_next: "Next",
      show_clickable_nav: true,
      on_finish: function(){
        minSetSize = 3
        selection = jsPsych.randomization.sampleWithoutReplacement(possibleNumbers, minSetSize)
      }
    }

var test_stimuli = {
  type: 'html-keyboard-response',
  stimulus: function(){
    selection_id+=1
    return '<div style="font-size:70px;">'+selection[selection_id]+'</div>'
  },
  choices: jsPsych.NO_KEYS,
  trial_duration: stimuli_duration,
  on_finish: function(){
    if (selection_id + 1 >=selection.length){
      jsPsych.endCurrentTimeline()
    }
  }
}

var recall = {
  type: 'digit-span-recall',
  correct_order: function(){
    return selection
  },
  trial_duration: recall_duration,
  on_finish: function(){
    acc = jsPsych.data.get().last(1).values()[0].accuracy;
    if (acc==1){
      if (highest_span_score < minSetSize){
        highest_span_score = minSetSize
        }
        minSetSize+=1
        nError = 0
    } else if (nError < 1) { // checks for number of consecutive errors
      nError += 1
    } else {
      if (consec_error_score < minSetSize){
        consec_error_score = minSetSize
      }
      minSetSize = Math.max( 3, minSetSize-1)
      }
    if (minSetSize<=8){ // bottom code prevents immediate repition of digits
      selection = jsPsych.randomization.sampleWithoutReplacement(possibleNumbers, minSetSize)
    } else {
      selection = jsPsych.randomization.sampleWithoutReplacement(possibleNumbers, 8)
      var extra = minSetSize-8
      var id = possibleNumbers.indexOf(selection[7])
      possibleNumbers.splice(id, 1);
      var extraNumbers= jsPsych.randomization.sampleWithoutReplacement(possibleNumbers, extra)
      selection = selection.concat(extraNumbers)
      possibleNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]
    }
    selection_id = -1
  }
}

var feedback = {
  type: 'html-keyboard-response',
  stimulus: function(){
    var text = ""
    var accuracy = jsPsych.data.get().last(1).values()[0].accuracy
    if (accuracy==1){
      text += '<div style="font-size:35px; color:rgb(0 220 0)"><b>Correct</div>'
    } else {
      text += '<div style="font-size:35px; color:rgb(240 0 0)"><b>Incorrect</div>'
    }
    //text += '<div style="font-size:30px; color:rgb(0 0 0)"><br><br>New trial starting now.</div>'
    return text
  },
  choices: jsPsych.NO_KEYS,
  trial_duration: 1000
}

var conclusion = {
  type: 'html-keyboard-response',
  stimulus: function(){
    return '<div style="font-size:20px;">You have completed the task.<br>Thank you for your participation in this task.<br><br>Maximum number of digits recalled correctly was ' + highest_span_score +'.<br><br>Maximum number of digits reached before making two consecutive errors was ' +consec_error_score+'.<br><br>Please tell the Research Assistant you have completed the task.</div>'
},
  choices: jsPsych.NO_KEYS
//  trial_duration:1000
}

  var test_stack = {
    timeline: [test_stimuli],
    repetitions: 17
  }

  var test_procedure = {
    timeline: [test_stack, recall, feedback],
    repetitions: nTrials
  }

  var demo_procedure = {
    timeline: [test_stack, recall, feedback],
    repetitions: 3
  }

function saveData(filename, filedata){
      $.ajax({
            type:'post',
            cache: false,
            url: 'save_data.php', // this is the path to the above PHP script
            data: {filename: filename, filedata: filedata}
      });
};

var IDsub = Date.now()

var dataLog = {
 type: 'html-keyboard-response',
 stimulus: " ",
 trial_duration: 100,
 on_finish: function(data) {
    var data = jsPsych.data.get().filter({trial_type: 'digit-span-recall'});
    if (file_name == null){
      file_name = "WM_digit_span_"+partN+"_"+IDsub.toString()+".csv"}
    else{
      file_name += ".csv"
    }
    if (local){
      data.localSave('csv', file_name )
    } else {
      saveData(file_name, data.csv());
    }
  }
}

timeline = [p_details]
timeline.push({
  type: 'fullscreen',
  fullscreen_mode: true
});
timeline = timeline.concat([instructions, demo_procedure, instructions_node, test_procedure])
timeline.push({
  type: 'fullscreen',
  fullscreen_mode: false
});
timeline.push(dataLog)
timeline.push(conclusion)


jsPsych.init({
  timeline: timeline,
  on_finish: function() {
    jsPsych.data.displayData(); // comment out if you do not want to display results at the end of task

	 // save to qualtrics embedded data
        Qualtrics.SurveyEngine.setEmbeddedData("nError", nError);
        Qualtrics.SurveyEngine.setEmbeddedData("highest_span_score", highest_span_score);
	    Qualtrics.SurveyEngine.setEmbeddedData("consec_error_score", consec_error_score);
	  
	/* Change 6: Adding the clean up and continue functions.*/
        // clear the stage
	jQuery('#display_stage').remove();
        jQuery('#display_stage_background').remove();
	
	// simulate click on Qualtrics "next" button, making use of the Qualtrics JS API
    qthis.clickNextButton();
  }
});
    }
});

Qualtrics.SurveyEngine.addOnReady(function()
{
	/*Place your JavaScript here to run when the page is fully displayed*/

});

Qualtrics.SurveyEngine.addOnUnload(function()
{
	/*Place your JavaScript here to run when the page is unloaded*/

});
