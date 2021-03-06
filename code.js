Function.prototype.inheritsFrom = function( parentClassOrObject ){ 
	if ( parentClassOrObject.constructor == Function ) 
	{ 
		//Normal Inheritance 
		this.prototype = new parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject.prototype;
	} 
	else 
	{ 
		//Pure Virtual Inheritance 
		this.prototype = parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject;
	} 
	return this;
} 

var UTIL = (function() {
	function dateComparator(dateA, dateB) {
		dateA = dateA.split("/");
		dateB = dateB.split("/");
		var dateAMonth = parseInt(dateA[0]);
		var dateBMonth = parseInt(dateB[0]);
		var dateAYear = parseInt(dateA[2]);
		var dateBYear = parseInt(dateB[2]);

		if (dateAYear != dateBYear) {
			return dateAYear > dateBYear ? 1 : -1;
		} else if (dateAMonth != dateBMonth) {
			return dateAMonth > dateBMonth ? 1 : -1; 
		} else {
			var dateAday = parseInt(dateA[1]);
			var dateBDay = parseInt(dateB[1]);
			if (dateAday > dateBDay)
				return 1;
			else if (dateAday < dateBDay)
				return -1;
			else
				return 0;
		}
	}

	function dateObjToString(date) {
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var day = date.getDate();

		var s = month + "/" + day + "/" + year;

		return s;
	}

	this.colorContext = {
		"green": "list-group-item-success",
		"lightblue": "list-group-item-info",
		"red": "list-group-item-danger",
		"orange": "list-group-item-warning"
	}


	function validateDate(testdate) {
		var date_regex = /^(0[1-9]|1[0-2]|[1-9])\/([1-9]|0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/ ;
		return date_regex.test(testdate);
	}

	return {
		dateComparator: dateComparator,
		dateObjToString: dateObjToString,
		colorContext: colorContext,
		validateDate: validateDate
	}
})();
// invoke parent constructor of this
function Super(obj) {
	if (obj.parent) return obj.parent.constructor;
}


function Task(title, details, date, color, description) {
	this.title = title || "no title";
	this.details = details || "no details";
	// pad year to 4 digits if only 2 digits
	this.date = date || "10/24/2014";
	this.color = UTIL.colorContext[color]|| UTIL.colorContext["lightblue"];
	this.description = description || "no description";
	this.editing = false;

	var nodeHTML = "<a href=\"#\" class=\"list-group-item " + this.color +"\">" +
	  			  "<button type=\"button\" class=\"close\" data-dismiss=\"alert\"><span aria-hidden=\"true\">&times;</span><span class=\"sr-only\">Close</span></button>" +
	  			  "<div class=\"task-header\"><strong><span class=\"task-title\">" + this.title + "</span></strong> </div>" +
	  			  "<div><span class=\"task-date\">" + this.date + "</span>" +
	  			  "</div>" +
				  "<div class=\"task-description\">" + this.description + 
				  "</div><div class=\"taskedit\"></div></a>";

	this.node = $(nodeHTML);

	var self = this;

	this.node.click(function() {
		self.edit();
	});
}
Task.prototype.today = function()  {
	var today = "<span class=\"label label-success\">Today!</span>";
	this.node.find(".task-header").append(today);
}
// return 1 if this is greater, -1 if other is greater
Task.prototype.compare = function(other) {
	return UTIL.dateComparator(this.date, other.date);
}
Task.prototype.toString = function() {
	return "{Task Object // Title: " + this.title + ", details:" + this.details + ", date: " + this.date + " }";
}
Task.prototype.domNode = function() {
	return this.node;
}
Task.prototype.destroy = function() {
	this.node.remove();
	this.node = null;
}
Task.prototype.markPast = function() {
	this.node.addClass("past");
}
Task.prototype.isEqual = function(other) {
	var sameTitle = this.title === other.title;
	var sameDate = this.date === other.date;
	var equal = sameTitle && sameDate;
	return equal;
}
Task.prototype.edit = function(other) {
	if(this.editing)
		return;

	this.editing = true;
	var container = this.node.children(".taskedit");


	var form = "<div class=\"panel panel-default\">" +
				"<div class=\"panel-heading\">Edit Description</div>" +
				"<div class=\"panel-body\"><form>" +
				"<textarea class=\"form-control\"></textarea>" +
				"<button class=\"btn btn-primary\">Submit</button></form></div></div>";
	form = $(form);
	form.click(function(e) {
		e.stopPropagation();
	});
	var self = this;
	form.find("button").click(function(e) {
		e.preventDefault();

		var newDescription = form.find("textarea").val();
		self.description = newDescription;

		var descriptionContainer = self.node.find(".task-description");
		console.log(descriptionContainer);
		if (newDescription) {
			descriptionContainer.empty();
			descriptionContainer.append(newDescription);
		}
		container.empty();

		setTimeout(function() { self.editing = false}, 1000);
	});
	container.append(form);
}

function Project(container, title, m) {
	this.tasks = [];
	this.title = title || "no project title";
	this.date = UTIL.dateObjToString(new Date());

	var node = "<ul class=\"list-group project emptyproject\">" +
			"<h3 class=\"emptyprojectmsg\">This project has no tasks</h3>" +
			"<div class=\"projecttasks\"></div>" +
			"</ul>";
	this.context = $(node);
	container.append(this.context);
	this.container = this.context.children(".projecttasks");
	this.m = m;
}
Project.prototype.addTask = function(task) {
	if (this.tasks.length === 0) {
		this.context.removeClass("emptyproject");
	}
	for(var i = 0; i < this.tasks.length; i++) {
		var currTask= this.tasks[i];
		var cmp = currTask.compare(task);
		if (cmp === 1) {
			break;
		}
	}
	if(i === this.tasks.length) {
		this.tasks.push(task);
		this.container.append(task.domNode());
		this.highlightTasks([this.tasks.length-1]);
	} else {
		this.tasks.splice(i, 0, task);
		task.domNode().insertBefore(this.container.children().eq(i));
		this.highlightTasks([i]);
	}
	
	if(this.checkTaskImportant(task)) {
		task.today();
		this.m.notify(task, this.title);
	}
	var self = this;
	task.node.find("button").click(function(e) {
		// this line is for right click , but its interfering with form elements
		// e.preventDefault();
		self.m.notify(task, self.title, "remove");
		task.destroy();

	});
}
Project.prototype.highlightTasks = function(indices) {
	if(indices) {
		for(var i = 0 ; i < indices.length; i++) {
			var index = indices[i];
			if(index >= 0 && index < this.tasks.length) {
				var currTask = this.tasks[index];

				if(this.checkTaskPast(currTask))
					currTask.markPast();
			}
		}
	} else {
		for(var i = 0 ; i < this.tasks.length; i++) {
			var currTask = this.tasks[i];
			if(this.checkTaskPast(currTask))
				currTask.markPast();
		}
	}
}
Project.prototype.checkTaskPast = function(task) {
	var cmp = UTIL.dateComparator(task.date, this.date);
	if(cmp < 0)
		return true;
}
Project.prototype.checkTaskImportant = function(task) {
	var cmp = UTIL.dateComparator(task.date, this.date);
	if (cmp === 0)
		return true;
}

Project.prototype.getNotifications = function() {
	var notifs = [];
	for (var i = 0 ; i < this.tasks.length; i++) {
		var task = this.tasks[i];

		var comparison = UTIL.dateComparator(task.date, this.date);
		if (comparison === 0) {
			notifs.push(new Notification(task, this.title ));
		} 
	}

	return notifs;
}
Project.prototype.print = function() {
	for(var i = 0; i < this.tasks.length; i++) {
		console.log(this.tasks[i].toString());
	}
}
Project.prototype.destroy = function() {
	for(var i = 0; i < this.tasks.length; i++) {
		this.tasks[i].destroy();
	}
	this.context.remove();
}

function Notification(task, projectTitle) {
	this.task = task || new Task();
	this.projectTitle = projectTitle || "unknown projectTitle";
}
function NotificationQ() {
	this.notifs = {};
	this.context = null;

}
NotificationQ.prototype.addNotif = function(notif) {
	if (!this.context) {
		console.log("no context");
		retturn;
	}

	console.log("inside add notif");
	var key = notif.projectTitle;
	var task = notif.task;

	var node = "<li class=\"list-group-item notif\">" +
			   "<span class=\"context\">" + key + "</span> " + task.title + 
			   "</li>";
	node = $(node);
	if (this.context === key) {
		node.addClass("selectedNotif");
	}
	console.log($("#notifications"));
	$("#notifications").append(node);

	var taskTuple = {
		"task": task,
		"node": node
	};
	if (this.notifs[key]) {
		this.notifs[key].push(taskTuple);
	} else {
		this.notifs[key] = [taskTuple];
	}

}
NotificationQ.prototype.removeNotif = function(notif) {
	console.log("NotificationQ.removeNotif");
	var key = notif.projectTitle;
	var task = notif.task;

	console.log("key" + key);
	console.log(this.notifs[key]);
	var relevantTasks = this.notifs[key];
	if(relevantTasks) {
		for(var i = 0 ; i < relevantTasks.length; i++) {
			var currTuple = relevantTasks[i];
			var currTask = currTuple["task"];
			var currNode = currTuple["node"];
			if (currTask.isEqual(task)) {
				currNode.remove();
				relevantTasks.splice(i, 1);
			}
		}
	}
}

NotificationQ.prototype.setContext = function(context) {
	console.log("setting context" + context);
	this.context = context;

	var filteredNotifs = $("#notifications").children();
	$("#notifications").children().removeClass("selectedNotif");
	var msg = "for all projects";
	if(context !== "All") {
		filteredNotifs = $("#notifications").children().filter(function() {
			return  $(this).children(".context").html() === context;
		});
		msg = "for project: " + context;
	}

	$("#filtered-mode-label").html(msg);

	filteredNotifs.addClass("selectedNotif");
}

function Manager() {
	this.projects = {};
	this.currProject = -1;
	this.q = new NotificationQ();
	var self = this;

	var ENTRY_FORM_ID = "side-task-form";
	$("#side-task-submit").click(function(e) {
		e.preventDefault();

		var p = self.getCurrContext();
		if (!p) {
			console.log("Manager: no context");
		}

		var entry_title_selector = "#" + ENTRY_FORM_ID + " [name=entry_task_title]";
		var entry_duration_selector = "#" + ENTRY_FORM_ID + " [name=entry_task_date]";
		var entry_color_selector = "#" + ENTRY_FORM_ID + " select";
		var entry_description_selector = "#" + ENTRY_FORM_ID +  " textarea";

		var entryTitle = $(entry_title_selector).val();
		if(!entryTitle) {
			alert("no title supplied");
			return;
		}
		if (entryTitle.length > 40) {
			alert("title must be less than 40 charactrs long");
			return;
		}

		var entryDate = $(entry_duration_selector).val();
		if (!entryDate) {
			alert("no date specified");
			return;
		}
		if (!UTIL.validateDate(entryDate)) {
			alert("invalid date");
			return;
		}
		var entryColor = $(entry_color_selector).val();
		var entryDescription = $(entry_description_selector).val();

		p.addTask(new Task(entryTitle, null, entryDate, entryColor, entryDescription));
	});

	$("#project-submit").click(function(e) {
		e.preventDefault();

		var project_title_selector = "#project-form [name=project-title]";
		var inputVal = $(project_title_selector).val();

		var projectTitle = inputVal;

		if(!projectTitle) {
			alert("did not supply title");
			return;
		}
		if (projectTitle === "All") {
			alert("cannot name project: All");
			return;
		}

		var tasksContainer = $("#tasks-container");
		var p = new Project(tasksContainer, projectTitle, self);

		if(!self.addProject(p)) {
			p.destroy();
			alert("Cannot add project: \"" + p.title + "\". A project with the same name already exists.");
		}
	});

	$("#sidebar_task").addClass("active-form");
	$("#top_task").click(function(e) {
		e.preventDefault();
		$(".side-ui").removeClass("active-form");
		$("#sidebar_task").addClass("active-form");


		$(".navbar-right li").removeClass("active");
		$(this).parent().addClass("active");
	});
	$("#top_project").click(function(e) {
		e.preventDefault();
		$(".side-ui").removeClass("active-form");
		$("#sidebar_project").addClass("active-form");

		$(".navbar-right li").removeClass("active");
		$(this).parent().addClass("active");
	});
}
Manager.prototype.addProject = function(project) {
	var isDuplicate = this.containsProject(project.title);
	if(isDuplicate) {
		return false;
	}

	this.projects[project.title] = project;
	

	var self = this;
	// var optionNode = "<option value=\"" + project.title +"\">" + project.title + "</option>";

	var optionNode = $("<li role=\"presentation\"><a href=\"#\">" + project.title + "</a></li>");
	$("#project-list").append(optionNode);
	$(optionNode).click(function() {
		var ctx = optionNode.find("a").html();
		self.setContext(ctx);
	});

	var filterNode = $("<li><a href=\"#\">" + project.title + "</a></li>");
	$("#filter-list").append(filterNode);
	$("#filter-list li").unbind();
	$("#filter-list li").click(function() {
		var selectedContext = $(this).text();
		self.q.setContext(selectedContext);
	});

	this.setContext(project.title);
	return true;
}
Manager.prototype.getCurrContext = function() {
	if (!this.projects || this.projects.length === 0)
		return null;

	return this.projects[this.currProject];
}
Manager.prototype.setContext = function(ctx) {
	console.log("Manager"+ ctx);
	this.currProject = ctx;

	var p = this.projects[this.currProject];

	$(".project").addClass("inactive");
	p.container.parent().removeClass("inactive");

	this.q.setContext(ctx);
	$("#notif_mode").val(this.currProject);

	// Highlight the appropriate tab
	$("#project-list").children().removeClass("active");
	var liNode = $("#project-list").children().filter(function() {
		var projectTitle= $(this).find("a").html();
		return projectTitle === ctx;
	});
	liNode.addClass("active");
}
Manager.prototype.containsProject = function(projectTitle) {
	return (projectTitle in this.projects) && true;
}
Manager.prototype.notify = function(task, context, e) {
	if (e === "remove") {
		console.log("Manager: removing");
		this.q.removeNotif(new Notification(task, context));
		return;
	}

	console.log("notified");
	var n = new Notification(task, context);
	this.q.addNotif(n);
}
$(document).ready(function() {
	$("#datepicker").datepicker();

	var m = new Manager();

	var tasksContainer = $("#tasks-container");

	var p = new Project(tasksContainer, "Become a kungfu master", m);
	var p2 = new Project(tasksContainer, "Open a Restaurant", m);
	

	
	m.addProject(p);
	m.addProject(p2);

	p.addTask(new Task());
	p.addTask(new Task("Parents killed by ninjas", null, "10/2/1985"));
	p.addTask(new Task("Beg kungfu master to be student", null, "4/2/1991"));
	p.addTask(new Task("Become master of kickboxing", null, "9/11/2001"));
	p.addTask(new Task("Win UFC", null, "6/23/2004"));
	p.addTask(new Task("Seek revenge", null, "10/31/2014"));
	p.addTask(new Task("Death", null, "10/31/2017"));
	p2.addTask(new Task("Dream", null, "11/3/1999"));
	p2.addTask(new Task("Drop out of college", null, "3/11/2012"));
	p2.addTask(new Task("Go to france", null, "4/16/2013"));
	p2.addTask(new Task("Enroll in culinary school", null, "7/16/2013"));
	p2.addTask(new Task("Graduate from culinary school", null, "10/31/2014"));
	p2.addTask(new Task("Buy a plot of land", null, "11/1/2014"));
	p2.addTask(new Task("Print a menu", null, "3/11/2017"));
	p2.addTask(new Task("Grand opening!", null, "8/11/2018"));
	p2.addTask(new Task("Bankruptcy. ", null, "11/2/2014"));

	var ENTRY_FORM_ID = "entry_form";
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


		var month = Math.floor(Math.random() * 12) + 1;
		var day = Math.floor(Math.random() * 29) + 1;
		var year = 2014;

		var duration = month + "/" + day + "/" + year;
		var entry_duration_selector = "#" + ENTRY_FORM_ID + " [name=entry_duration]";
		$(entry_duration_selector).val(duration);

		var colors = ["purple", "green", "blue", "orange", "grey", "red"];
		var color = colors[Math.floor(Math.random() * colors.length)];
		var entry_color_selector = "#" + ENTRY_FORM_ID + " select";
		$(entry_color_selector).val(color);
	});
});