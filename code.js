$(document).ready(function() {
	var startDate = new Date(2014, 9, 23, 6, 0, 0, 0);
	var currDate = new Date();

	var hideDatepickerTimer = null;
	var newTaskTimer = null;

	$("#startdate").hide();
	$("#show_setstartdate").click(function() {
		clearTimeout(hideDatepickerTimer);
		$("#startdate").show();
	})
	$( "#datepicker" ).datepicker();

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
	// object for scheduling
	var adt = (function() {
		self = this;
		self.isConstructed = false;

		function construct(startDate, currDate) {
			if (self.isConstructed) {
				throw "Only call constructor once, pretty please";
			}
			self.isConstructed = true;

			var st
			self.startDate = startDate;
			self.currDate = currDate;
			// begin construction
			computeTimeDiff();
			self.tasks = [];
			self.index = -1;

		}

		function computeTimeDiff() {
			loadStartDate();
			loadCurrDate();
			loadMinutesSince();

			self.timeDiff = Math.floor((self.currDate - self.startDate) / 60000);
			console.log("self.timeDiff = " + self.timeDiff);
		}
		function addTask(task) {
			self.tasks.push(task);
		}

		function findIndex() {
			self.tasks.removeClass("expectedComplete");
			var totalTime = 0;
			var i = 0;
			//console.log("self.tasks.length " + self.tasks.length);
			while ( i < self.tasks.length && totalTime < self.timeDiff) {
				//console.log("i: " + i);
				//console.log("totalTime: " + totalTime);
				var task = $(self.tasks[i]);
				var duration = parseInt(task.children(".duration").html());
				totalTime += duration;
				console.log("totalTime" + totalTime);
				i++;

				task.addClass("expectedComplete");
			} 
			console.log(i);
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

		// date: string in the form mm/dd/yyyy
		function setDate(date) {
			date = date.split("/");
			var month = date[0] - 1;
			var day = date[1];
			var year = date[2];

			console.log("setting date to " + month + ", " + day + " , " + year);
			date = new Date(year, month, day, 0, 0, 0, 0);
			console.log(date);
			self.startDate = date;

			update();
		}

		function update() {
			updateTasks();
			self.tasks.removeClass("expectedComplete");
			computeTimeDiff();
			findIndex();
		}
		function writeDate(date, id) {
			var year = date.getFullYear();
			var month = date.getMonth() + 1;
			var day = date.getDate();
			var hours = date.getHours();

			var s = id + ": " + month + " / " + day + " / " + year + ", " + hours + " : 00";
			$("#" + id).empty().append(s);
		}

		function loadStartDate() {
			var START_DATE_ID = "start_date";
			writeDate(self.startDate, START_DATE_ID);
		}

		function loadCurrDate() {
			var CURR_DATE_ID = "curr_date";

			writeDate(self.currDate, CURR_DATE_ID);
		}

		function loadMinutesSince() {
			var msInMinute = 60 * 1000;
			var minutesInHour = 60;
			var timeDiff = self.currDate - self.startDate;
			var minuteDiff = timeDiff / msInMinute;
			// round to 2 decimals
			minuteDiff = Math.round(minuteDiff * 100) / 100;
			var hourDiff = minuteDiff / minutesInHour;
			// round to 2 decimals
			hourDiff = Math.round(hourDiff * 100) / 100;

			var id = "time_diff";

			var s = id + ": " + minuteDiff + " minutes or " + hourDiff + " hours";

			$("#" + id).empty().append(s);
		}

		return {
			construct: construct,
			print: print,
			addTask: addTask,
			findIndex: findIndex,
			updateTasks: updateTasks,
			setDate: setDate,
			update: update
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

	$("#submitdate").click(function(e) {
		e.preventDefault();
		var date = $("#datepicker").val();
		adt.setDate(date);
		hideDatepickerTimer = setTimeout(function() {
			$("#startdate").slideUp(700);
		}, 1000);
	});

	$(".task").bind("mousedown", function(e) {
		e.preventDefault();
		var mousedownType = e.which;
		var RIGHT_CLICK = 3;

		if (mousedownType === RIGHT_CLICK) {
			$(this).remove();
			adt.update();
		}
	});
	$(".task").bind("contextmenu", function() {
		return false;
	});

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
		newTaskTimer = setTimeout(function() {
			$("#" + ENTRY_FORM_ID).slideUp(700);
		}, 700);
	});

	function showEntryBox() {
		$("#" + ENTRY_FORM_ID).show();
		clearTimeout(newTaskTimer);
	}

	function addTask(title, duration, color) {
		if (!title || title.length === 0) {
			alert("Did Not Supply TITLE");
			return;
		}
		if (!duration || duration.length === 0) {
			alert("Did Not supply DURATION");
			return;
		}

		var node = "<div class=\"task\">" + title + "<span class=\"duration\">" + duration +"</span><button class=\"completedTaskButton\">mark as Completed</button></div>";
		node = $(node);
		node.addClass(color);
		node.addClass("notcomplete");
		$("#" + TASK_LIST_ID).append(node);
	}


	$("button.completedTaskButton").click(function() {
		$(this).parent().removeClass("notcomplete");
	})
});
