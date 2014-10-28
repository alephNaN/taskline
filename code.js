$(document).ready(function() {
	var startDate = new Date(2014, 9, 20, 6, 0, 0, 0);
	var currDate = new Date();
	loadStartDate();
	loadCurrDate();
	loadMinutesSince();

	
	// object for scheduling
	var adt = (function() {
		self = this;
		self.isConstructed = false;

		function construct(startDate, currDate) {
			if (self.isConstructed) {
				throw "Only call constructor once, pretty please";
			}
			self.isConstructed = true;

			// begin construction
			self.startDate = startDate;
			self.currDate = currDate;
			self.timeDiff = Math.floor((self.currDate - self.startDate) / 60000);
			self.tasks = [];
			self.index = -1;

		}

		function addTask(task) {
			self.tasks.push(task);
		}

		function findIndex() {
			var totalTime = 0;
			var i = 0;
			//console.log("self.tasks.length " + self.tasks.length);
			while ( i < self.tasks.length && totalTime < self.timeDiff) {
				//console.log("i: " + i);
				//console.log("totalTime: " + totalTime);
				var task = $(tasks[i]);
				var duration = parseInt(task.children(".duration").html());
				totalTime += duration;
				i++;

				task.addClass("expectedComplete");
			}
		}

		function print() {
			console.log(self.tasks);
		}

		function updateTasks() {
			var containerSelector = "tasks";
			var container = $("#" + containerSelector);
			var tasks = container.children();
			self.tasks = tasks;
		}

		return {
			construct: construct,
			print: print,
			addTask: addTask,
			findIndex: findIndex,
			updateTasks: updateTasks
		}
	})();
	adt.construct(startDate, currDate);
	/* for (var i = 0 ; i < 50; i++) {
		var taskDuration = Math.floor(Math.random() * 30) + 15;
		adt.addTask(taskDuration);
	} */
	//adt.print();
	adt.updateTasks();
	adt.findIndex();

	function writeDate(date, id) {
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var day = date.getDate();
		var hours = date.getHours();

		var s = month + " / " + day + " / " + year + ", " + hours + " : 00";
		$("#" + id).append(s);
	}

	function loadStartDate() {
		var START_DATE_ID = "start_date";

		writeDate(startDate, START_DATE_ID);
	}

	function loadCurrDate() {
		var CURR_DATE_ID = "curr_date";

		writeDate(currDate, CURR_DATE_ID);
	}

	function loadMinutesSince() {
		var msInMinute = 60 * 1000;
		var minutesInHour = 60;
		var timeDiff = currDate - startDate;
		var minuteDiff = timeDiff / msInMinute;
		// round to 2 decimals
		minuteDiff = Math.round(minuteDiff * 100) / 100;
		var hourDiff = minuteDiff / minutesInHour;
		// round to 2 decimals
		hourDiff = Math.round(hourDiff * 100) / 100;

		var s = minuteDiff + " minutes or " + hourDiff + " hours";

		var id = "time_diff";
		$("#" + id).append(s);
	}

	var ENTRY_FORM_ID = "entry_form";
	var ENTRY_SUBMIT_ID = "entry_submit";

	var ADD_TASK_BUTTON_ID = "add_task";

	var TASK_LIST_ID = "tasks";

	$("#" + ADD_TASK_BUTTON_ID).click(function() {
		showEntryBox();
	});

	$("#" + ENTRY_SUBMIT_ID).click(function(e) {
		e.preventDefault();

		var entry_title_selector = "#" + ENTRY_FORM_ID + " [name=entry_title]";
		var entry_duration_selector = "#" + ENTRY_FORM_ID + " [name=entry_duration]";
		var entry_color_selector = "#" + ENTRY_FORM_ID + " select";

		var entryTitle = $(entry_title_selector).val();
		var entryDuration = $(entry_duration_selector).val();
		var entryColor = $(entry_color_selector).val();

		addTask(entryTitle, entryDuration, entryColor);
	});

	function showEntryBox() {
		$("#" + ENTRY_FORM_ID).show();
	}

	function addTask(title, duration, color) {
		var node = "<div class=\"task\">" + title + "<span class=\"duration\">" + duration +"</span> </div>";
		node = $(node);
		node.addClass(color);
		node.addClass("notcomplete");
		$("#" + TASK_LIST_ID).append(node);
	}

	$("#generate_random_shit").click(function(e){
		e.preventDefault();

		var verbs = ["Eat", "Drink", "Finish", "Remember", "Write", "Choose", "Notify", "Select"];
		var verb = verbs[Math.floor(Math.random() * verbs.length)];
		var nouns = ["Dog", "Homework", "Car", "Bob", "Shelf", "Phone", "Bamboo Tree", "Notebook", "Picture Frame",
			"table"];
		var noun = nouns[Math.floor(Math.random() * nouns.length)];
		var locations = ["Church", "the Cafe", "School", "Bus Stop", "Library", "Observatory", "Gym"];
		var location = locations[Math.floor(Math.random() * locations.length)];
		var title = verb + " " + noun + " at " + location;
		var entry_title_selector = "#" + ENTRY_FORM_ID + " [name=entry_title]";
		$(entry_title_selector).val(title);

		var duration = Math.floor(Math.random() * 30) + 15;
		var entry_duration_selector = "#" + ENTRY_FORM_ID + " [name=entry_duration]";
		$(entry_duration_selector).val(duration);

		var colors = ["purple", "green", "blue", "orange", "grey", "red"];
		var color = colors[Math.floor(Math.random() * colors.length)];
		var entry_color_selector = "#" + ENTRY_FORM_ID + " select";
		$(entry_color_selector).val(color);
	});

	$("button.completedTaskButton").click(function() {
		$(this).parent().removeClass("notcomplete");
	})
});
