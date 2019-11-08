//********BULDING BLOCK*********
function block(num, kind_name, which_side, num_special_pebbles){
	this.number_pebble = num; //the number of pebble
	this.kind = kind_name; // big or small ~ 1 or 0
	this.side = which_side; // HUMAN or computer or none? ~ 1 or -1 or 0
	this.num_special_pebble  = num_special_pebbles; // number of bigger pebble
} 

//*****************************************
var  a_table ={
	blocks: [],
	//who_is_playing = i, // 1: HUMAN, -1: computer
	score: [0,0],
	set_a_new_game: function(){
		var i = 0;
		for (i = 1; i<=5 ; ++i){
			this.blocks[i] = new block(5, 0, 1, 0);
		}

		for (i = 7; i<=11 ; ++i){
			this.blocks[i] = new block(5, 0, -1, 0);
		}

		this.blocks[0] = new block(0, 1, 0, 1);
		this.blocks[6] = new block(0, 1, 0, 1);

	},
	terminal_check: function(){
			if (this.blocks[0].number_pebble==0 && this.blocks[0].num_special_pebble ==0 
				&& this.blocks[6].number_pebble==0 && this.blocks[6].num_special_pebble ==0)
				return 1
			else return 0;
		},
	next_index: function(index, right_left){
		if (right_left==1)
			if (index==11) return 0
			else return index+1;
		if (right_left==0) 
			if (index==0) return 11
			else return index-1;
	},
	check_eat_go_end: function(locate, right_left){
		var index = locate;
		var score = 0;
		index = this.next_index(index,right_left);
		if (this.blocks[index].kind!=1&&this.blocks[index].number_pebble!=0)
			return 0 // CONTINUE MOVE ~ GO
		else if((this.blocks[index].kind==1&&(this.blocks[index].number_pebble+this.blocks[index].num_special_pebble!=0))||
				((this.blocks[index].number_pebble+this.blocks[index].num_special_pebble==0)&&
									(this.blocks[this.next_index(index,right_left)].number_pebble+this.blocks[this.next_index(index,right_left)].num_special_pebble==0)))
			return -1
		else return 1;

		
	},
	show: function(){
		for (var i = 0; i<= 11; i++){
			document.getElementById(i).innerHTML = this.blocks[i].number_pebble;
			if (this.blocks[i].kind==1)
				document.getElementById(i).innerHTML = this.blocks[i].number_pebble.toString()+" & "+this.blocks[i].num_special_pebble.toString();
		}
	},
	fix_state: function(side){
		var d = 0;
		for (var i =0; i<=11; ++i){
			if (this.blocks[i].side==side)
				if (this.blocks[i].number_pebble==0) ++d;
		}

		if (this.terminal_check()==0 && d==5){
			for (var i =0; i<=11; ++i){
				if (this.blocks[i].side==side)
					this.blocks[i].number_pebble+=1;
			}
			if (side==-1) x = 0
			else x = 1;
			this.score[x] -=5;
		}
	}
};

//***********BUILDING PLAYER***************
function a_hand(num, locate){
	this.number= num; //number of pebble
	this.location = locate;// index of current block
}

class player{
	constructor(who_is_playing, scores)
	{
		this.who_is_playing = who_is_playing;
		this.score = scores;
		this.hand = new a_hand(0, 1);
		this.table = a_table;
	}
	move_simple(state, locate, right_left){
		this.hand.number = state.blocks[locate].number_pebble;
		state.blocks[locate].number_pebble = 0;
		var index = locate;
		if (right_left == 1){ //right = 1; left = 0...
			while (this.hand.number!=0){
				if (index ==11) index = 0
				else index++;
				state.blocks[index].number_pebble++;
				--this.hand.number;
			}
		}
		else{
			while (this.hand.number!=0){
				if (index ==0) index = 11
				else --index;
				state.blocks[index].number_pebble++;
				--this.hand.number;
			}	
		}
		return index;
	}
	move(state, locate, right_left){
		var index = locate;
		var score = 0;
		var x;
		var count = 0;
		state.fix_state(this.table.blocks[locate].side);
		if (state.blocks[locate].number_pebble ==0) return 0;
		while (state.check_eat_go_end(index, right_left)==0||count ==0){
			if (count!=0) {index = state.next_index(index, right_left);}
			index = this.move_simple(state, index, right_left);
			count++;
			//console.log(state.check_eat_go_end(index, right_left));
			if (state.check_eat_go_end(index, right_left)==1){
				while (state.check_eat_go_end(index, right_left)==1)
				{
					index = state.next_index(index, right_left);
					index = state.next_index(index, right_left);
					score += state.blocks[index].number_pebble+ state.blocks[index].num_special_pebble*5;
					state.blocks[index].num_special_pebble = 0;
					state.blocks[index].number_pebble = 0;
				}
				human.table.show();
				if (this.who_is_playing==-1) x = 0
				else x = 1;
				//console.log(score);
				return state.score[x] +=score;
			}
		}
		human.table.show();
		if (this.who_is_playing==-1) x = 0
		else x = 1;
		//console.log(score);
		return state.score[x] +=score;

	}
	make_a_copy_state(obj){
		var state = Object.assign({}, obj);
		state.blocks = JSON.parse(JSON.stringify(human.table.blocks));
		state.score = JSON.parse(JSON.stringify(human.table.score));
		return state;
	}

	Action(state){
		var i = 0;
		var a = [];
		if (state.terminal_check()==1) return a;
		for (i= 0; i<=11; i++){
			if (state.blocks[i].side==this.who_is_playing){
				if (state.blocks[i].number_pebble!=0){
					a.push([i,1]);
					a.push([i,0]);
				}
			}
		}
		return a;
	}

	Result(state, action){
		var new_state = this.make_a_copy_state(state);
		this.move(new_state, action[0], action[1]);
		return new_state;
	}

}

//**************SET COMPUTER ENNERGY TO PLAY************
var computer = new player(-1, 0);

function max(a,b){
	if (a>b) return a
	else return b;
}
function min(a,b){
	if (a<b) return a
	else return b;
}

computer.think = function(){
	var state = computer.make_a_copy_state(computer.table);
	var v, i = 0, action;
	[v, action] = computer.max_value(i, state, -Infinity, Infinity);
	//[v, action] = computer.greed(state);
	console.log("****************DONE!!!*******************");
	return [v, state, action];
}

computer.greed = function(state){
	state.fix_state(-1);
	var v = - Infinity;
	var action, next, score, value;
	for (var j =0; j< computer.Action(state).length; j++){
		score = computer.Result(state, computer.Action(state)[j]).score;
		value = score[0]-score[1];
		console.log(value);
		if (v<value){
			v = value;
			action = computer.Action(state)[j];
		}
	}
	console.log(action);
	return [v, action];
}

computer.max_value = function(i, state, alpha, beta){
	if (state.terminal_check()==1||i>5) return computer.eval(state);
	state.fix_state(-1);
	console.log("max_value i = "+i.toString());
	var v = - Infinity;
	var action, v_old, next;
	for (var j =0; j< computer.Action(state).length; j++){
		v_old = v;
		//action = computer.Action(state)[j];
		next = computer.min_value(i+1, computer.Result(state, computer.Action(state)[j]), alpha, beta);
		if (v<next){
			v = next;
			action = computer.Action(state)[j];
		}
		if (v>=beta) return v;
		alpha = max(v, alpha);
	}
	console.log("max_value end i = "+i.toString	()+" v = "+v.toString());
	if (i==0) return [v, action]
	else return v;
}

computer.min_value = function(i, state, alpha, beta){
	console.log("min_value i = "+i.toString());
	if (state.terminal_check()==1||i>=5) return computer.eval(state);
	state.fix_state(1);
	var v = Infinity;
	for (var j =0; j< human.Action(state).length; j++){
		console.log(computer.Action(state)[j]);
		v = min(v, computer.max_value(i+1, human.Result(state, human.Action(state)[j]), alpha, beta));
		if (v<=alpha) return v;
		beta = min(v, beta);
	}	
	console.log("min_value end i = "+i.toString()+" v = "+v.toString());
	return v;
}
computer.eval_greed = function(state){
	var value = -Infinity, score, score_max=[0,0];
	for (var i = 0; i< computer.Action(state).length; ++i){
		score = computer.Result(state, computer.Action(state)[i]).score;
		if (value<score[1]){
			value = score[1];
			score_max = score;
		}
	}
	return 3*(score_max[0] - score_max[1]);

}
computer.eval_one_more_step = function(state){
	for (var i = 0; i< computer.Action(state).length; ++i){
		if (computer.Result(state, computer.Action(state)[i]).terminal_check()==1 && state.score[1]>state.score[0]) 
			return -800;
	}
	return 0;
}
computer.eval = function(state){
	var point = 0;
	//state.fix_state(1);
	var number = 0;
	if (state.terminal_check()==1 && state.score[0]>state.score[1]) point += 1000;
	if (state.terminal_check()==1 && state.score[0]<state.score[1]) point -= 1000;
	if (state.score[0]!=state.score[0]) point+= state.score[0] - state.score[1];
	for (var i = 0; i<=11; i++){
		if (state.blocks[i].side==-1) number+=state.blocks[i].number_pebble;
		if (state.blocks[i].side== 1) number-=state.blocks[i].number_pebble;
	}

	point+=number;
	point+=computer.eval_greed(state);
	point+=computer.eval_one_more_step(state);
	return point;
}
//******************************************************
var human = new player(1,0);

//*******DISPLAY GAME********
var number0 = 0;
var number1 = 0;

for (var i = 0; i<=11; i++){
	if (0<i&&i<6){
		document.getElementById(i).ondblclick = function(){
			this.style.border = "thick solid #0000FF";
			number0 = 0;
			number1 = 0;
			if (human.table.terminal_check()==1){
				for (var i = 0; i<=11; i++){
					if (state.blocks[i].side==-1) number0+=state.blocks[i].number_pebble
					if (state.blocks[i].side== 1) number1+=state.blocks[i].number_pebble;
				} 
				human.table.score[1]+= number1;
				human.table.score[0]+= number0;
				var str;
				if (human.table.score[0]>human.table.score[1]){
					str = "You lose this time!"+ human.table.score[1].toString()+" - "+human.table.score[0].toString();
				}
				else str = "you win this time! "+ human.table.score[1].toString()+" - "+human.table.score[0].toString();
				document.getElementById("result").innerHTML = str;
				document.getElementById("game").style.display= "none";
				document.getElementById("list").style.display="block";
			} 
			else{
			
			if (document.getElementById("where").value=="l"){
				human.move(human.table, parseInt(this.id),0);
			}
			else human.move(human.table, parseInt(this.id),1);
			human.score += human.table.score[1];
			console.log(human.table.score);
			document.getElementById("human_score").innerHTML = human.table.score[1];
			document.getElementById("comp_score").innerHTML  = human.table.score[0];
			}
		}
		document.getElementById(i).onmouseout = function(){
			this.style.border = "none";
		}	
		
	}
	else if(6<i){
		document.getElementById(i).ondblclick = function(){
			this.style.border = "thick solid #0000FF";
			if (document.getElementById("where").value=="l"){
				computer.move(computer.table, parseInt(this.id),0);
			}
			else computer.move(computer.table, parseInt(this.id),1);
		}
		document.getElementById(i).onclick = function(){
			this.style.border = "groove";
		}
	}
}

document.getElementById("l").onclick = function(){
	document.getElementById("where").value = "l";
}
document.getElementById("r").onclick = function(){
	document.getElementById("where").value = "r";
}
//***********COMPUTER ACTION****************
var value, state, action;
document.getElementById("think").onclick = function(){
	this.style.border = "thick solid #0000FF";
	let number0= 0, number1 = 0;
	if (computer.table.terminal_check()==1){
		for (var i = 0; i<=11; i++){
			if (state.blocks[i].side==-1) number0+=state.blocks[i].number_pebble
			if (state.blocks[i].side== 1) number1+=state.blocks[i].number_pebble;
		} 
		human.table.score[1]+= number1;
		human.table.score[0]+= number0;

		var str;
		if (human.table.score[0]>human.table.score[1]){
			str = "You lose this time!"+ human.table.score[1].toString()+" - "+human.table.score[0].toString();
		}
		else str = "you win this time! "+ human.table.score[1].toString()+" - "+human.table.score[0].toString();
		document.getElementById("result").innerHTML = str;
		document.getElementById("game").style.display= "none";
		document.getElementById("list").style.display="block";
	}	
	[value, state, action] = computer.think();
	computer.move(computer.table, action[0], action[1]);
	computer.score += computer.table.score[0];
	human.score += human.table.score[1];
	console.log(computer.table.score);
	document.getElementById("human_score").innerHTML = computer.table.score[1];
	document.getElementById("comp_score").innerHTML  = computer.table.score[0];
	//a_table.score = [0,0];
}
document.getElementById("think").onmouseout = function(){
	this.style.border = "groove";
}
//**************UI**********************
document.getElementById("start").onclick = function(){
	document.getElementById("game").style.display = "block";
	human.table.set_a_new_game();
	a_table.score = [0,0];
	a_table.show();
	document.getElementById("list").style.display = "none";
}

document.getElementById("guild").onmouseover = function(){
	document.getElementById("how").style.display = "block";
}
document.getElementById("guild").onmouseout = function(){
	document.getElementById("how").style.display = "none";
}
