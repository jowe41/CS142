'use strict'

class TableTemplate{
	static fillIn(id,dict,columnName){
		var table=document.getElementById(id);
		var header=table.rows.item(0);
		var proc=new Cs142TemplateProcessor(header.innerHTML);
		var newHeader=proc.fillIn(dict);
		header.innerHTML=newHeader;

		var cols=[];
		if (columnName===undefined){
			cols=Array.from(Array(header.cells.length).keys());
		}
		else{
			for (var i=0;i<header.cells.length;i++){
				if(header.cells[i].innerHTML===columnName){
					cols=[i];
				}
			}
		}
		console.log(cols);
		for (var i=1;i<table.rows.length;i++){
			for (var j=0;j<cols.length;j++){
				var cell=table.rows[i].cells[cols[j]];
				var proc=new Cs142TemplateProcessor(cell.innerHTML);
				cell.innerHTML=proc.fillIn(dict);
			}
		}
		if (table.style.visibility==="hidden"){
			table.style.visibility="visible";
		}
	}
}