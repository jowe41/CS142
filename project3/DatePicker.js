'use strict'
class DatePicker{
	constructor(id,callback){
		this.id=id;
		this.callback=callback;
	}


	render(date){
		var parent=document.getElementById(this.id);
		parent.appendChild(this.createCalender(date));	
	}

	createCalender(date){
		var table=document.createElement("table");
		var header=this.createCalenderHeader(table,date);
		var daysInWeek=["Sun","Mon","Tues","Wed","Thur","Fri","Sat"];
		var rowWeek=header.insertRow(1);
		for (var i=0;i<7;i++){
			var cell=rowWeek.insertCell(i);
			cell.innerHTML=daysInWeek[i];
		}
		var firstDay=new Date(date.getFullYear(),date.getMonth(),1);
		var curDay=new Date(firstDay.getTime());
		curDay.setDate(-firstDay.getDay()+1);

		var rowIndex=2;
		while(true){
			var row=table.insertRow(rowIndex);
			rowIndex=rowIndex+1;
			for (var i=0;i<7;i++){
				var cell=row.insertCell(i);
				cell.innerHTML=curDay.getDate();
				if (curDay.getMonth()===date.getMonth()){
					cell.setAttribute("id","CurMonth");
					let ob={
						month:curDay.getMonth()+1,
						day:cell.innerHTML,
						year:curDay.getFullYear()
					}
					cell.addEventListener("click",()=>{
						this.callback(this.id,ob);
					});
				}
				else{
					cell.setAttribute("id","OtherMonth");
				}
				curDay.setDate(curDay.getDate()+1);
				
			}
			if (curDay.getMonth()!==date.getMonth()){
				break;
			}
		}
		return table;
	}

	createCalenderHeader(table,date){
		var header=table.createTHead();
		var headerRow=header.insertRow(0);
		var leftArrowCell=headerRow.insertCell(0);
		leftArrowCell.innerHTML="<";
		leftArrowCell.setAttribute("id","LeftArrow");

		var monthCell=headerRow.insertCell(1);
		var months=["January","February","March","April","May","June","July",
		"August","Semptember","October","November","December"];
		monthCell.innerHTML=months[date.getMonth()]+"   "+date.getFullYear();
		monthCell.colSpan="5";

		var rightArrowCell=headerRow.insertCell(2);
		rightArrowCell.innerHTML=">";
		rightArrowCell.setAttribute("id","RightArrow");

		leftArrowCell.addEventListener("click",()=>{
			table.remove();
			date.setMonth(date.getMonth()-1);
			console.log(date);
			this.render(date);
		});

		rightArrowCell.addEventListener("click",()=>{
			table.remove();
			date.setMonth(date.getMonth()+1);
			console.log(date);
			this.render(date);
		});
		return header;
	}
}

