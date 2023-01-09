url="http://127.0.0.1:7701"
function back(){
    loc=localStorage.getItem("location");
    if(loc=="business"){
        location.reload();
    }
    else if(loc=="warehouse"){
        goToBusiness();
    }
    else if(loc=="subWareHouse"){
        goToWarehouse();
    }
    else if(loc=="pallot"){
        goToLocations();
    }
    else{}
}

function dashboard(){
    request=url+"/api/getDashboardData";
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'GET',
        url: request,
        success: function(data){
            document.getElementById("totalBusniessT").innerHTML=data["totalBusniess"];
            document.getElementById("totalWarehousesT").innerHTML=data["totalWarehouses"];
            document.getElementById("totalSubWarehousesT").innerHTML=data["totalLocations"];
            document.getElementById("totalPallotsT").innerHTML=data["totalPallots"];
            document.getElementById("totalBinsT").innerHTML=data["totalBins"];
        }
    });
}

function warehouseHtml(item){
    html='<div class="warehouse">'+
    '<a id="'+item.id+'" onclick="goToLocations(this)"><span class="fa fa-clone fa-7x mr-3"></span><p>'+item.name+'</p></a>'+
    '</div>'
    return html
}
warehouses=[]
locations=[]
pallots=[]
bins=[]

function onLoadWareHouses(){
    warehouses.splice(0,warehouses.length);
    locations.splice(0,locations.length);
    pallots.splice(0,pallots.length);
    bins.splice(0,bins.length);
    localStorage.setItem("location","");
    document.getElementById("content").innerHTML="";
    $content=$("#content");
    $content.append('<h6 id="title">Warehouses</h6><br>');
    $content.append('<div style="font-size:24px;"><span class="fa fa-plus fa-7x mr-3" onclick="goToAddWareHouse()" style="cursor:pointer;"><p>WH</p></span></div><br>');
    $content.append('<div class="warehouses" id="warehouses"></div>');
    $warehouse=$("#warehouses");
    request=url+"/api/getAllWarehouses/";
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'GET',
        url: request,
        success: function(data){
            $.each(data["warehouses"],function(i,item){
                warehouses.push(item);
                html=warehouseHtml(item)
                $warehouse.append(html);
            })
            $.each(data["locations"],function(i,item){
                locations.push(item);
            })
            $.each(data["pallots"],function(i,item){
                pallots.push(item);
            })
            $.each(data["bins"],function(i,item){
                bins.push(item);
            })
            // $warehouse.append('<div onclick="goToAddWareHouse()"><span class="fa fa-plus fa-7x mr-3"></span><a><p>WH</p></a></div>');
        }
    });
    gotoDisplay();
}
function gotoDisplay(){
    console.log(warehouses);
}
function split(str, index) {
    let result = [str.slice(0, index), str.slice(index)];
    console.log(str)
    console.log(result)
    return result;
}
function locationsHtml(item,level){
    color=""
    console.log(item)
    tempStatus=""
    if(level=="parts"){tempFunc='goToLocInfo(this)'}
    else{tempFunc='goToPallots(this)'}
    if(item.status=='partiallyFilled'){color="#ffe30070";tempStatus="Partially Filled"}
    else if(item.status=='fullyFilled'){color="#6ea331b8";tempStatus="Fully Filled"}
    else{tempStatus="Empty"}
    html='<div class="business">'+
    '<a id="'+item.id+'" onclick="'+tempFunc+'"><span style="background:'+color+';" class="fa fa-clone fa-7x mr-3"></span><p>'+item.name+'<sub>'+tempStatus+'</sub></p></a>'+
    '</div>'
    return html
}
function goToLocations(param){
    temp2=String(param.id);
    if(temp2.indexOf("back")>-1){
        loc1=localStorage.getItem("location");
        index=loc1.lastIndexOf("/");
        let [loc,temp]=split(loc1,index)
        index0=loc.lastIndexOf("/");
        console.log(loc);
        let [loc0,temp0]=split(loc,index0)
        id=temp0.replace("/","");
        address=loc
        localStorage.setItem("location",address);
        var tempLoc=loc
        temp=tempLoc.split("/")
        warehouseName=""
        level=""
        $.each(warehouses,function(i,item){
            if(item.id==id){
                warehouseName=item.name;
                level=item.level;
                return false
            }
        })
        temp2=address.slice(1);
        index3=temp2.indexOf("/");
        address=warehouseName
    }
    else{
        loc=localStorage.getItem("location");
        id=param.id;
        id=id.replace("back","");
        address=loc+"/"+id
        localStorage.setItem("location",address);
        temp=loc.split("/")
        warehouseName=""
        level=""
        $.each(warehouses,function(i,item){
            if(item.id==id){
                warehouseName=item.name;
                level=item.level;
                return false
            }
        })
        temp2=address.slice(1);
        index3=temp2.indexOf("/");
        address=warehouseName
    }
    console.log(id);
    document.getElementById("content").innerHTML="";
    $content=$("#content");
    $content.append('<h6 style="margin-bottom:10px">Locations</h6>');
    $content.append('<h6 id="title">'+'AJCL/'+address+'</h6><br>');
    //$content.append('<div class="warehouse"><a onclick="goToPallots()"><span class="fa fa-th-large fa-3x mr3"></span><p style="text-align:left;">Inventory</p></a></div>');
    $content.append('<span onclick="onLoadWareHouses()" class="back fa fa-reply fa-7x mr-3"><p>Back</p></span>');
    $content.append('<div class="warehouses" id="warehouses"></div>')
    $warehouses=$("#warehouses");
    $.each(locations,function(i,item){
        if(item.refferenceId==id){
            html=locationsHtml(item,level);
            $warehouses.append(html);
        }
    });
    $warehouses.append('<div id="'+address+'" onclick="addPart(this)" class="warehouse"><span class="fa fa-plus fa-7x mr-3"></span><a><p>Location</p></a></div>');
}
function goToPallots(param){
    temp2=String(param.id);
    if(temp2.indexOf("back")>-1){
        loc1=localStorage.getItem("location");
        index=loc1.lastIndexOf("/");
        let [loc,temp]=split(loc1,index)
        index0=loc.lastIndexOf("/");
        console.log(loc);
        let [loc0,temp0]=split(loc,index0)
        id=temp0.replace("/","");
        address=loc;
        console.log(address)
        localStorage.setItem("location",address);
        var tempLoc=loc;
        temp=tempLoc.split("/")
        warehouseName=""
        console.log(temp[1]);
        level=""
        $.each(warehouses,function(i,item){
            if(item.id==temp[1]){
                warehouseName=item.name;
                level=item.level;
                console.log(item.name);
                return false
            }
        })
        pallotName=""
        // temp2=address.at(-1)
        $.each(locations,function(i,item){
            if(item.id==id){
                pallotName=item.name;
                console.log(item.name);
                return false
            }
        });
        locName="";
        $.each(locations,function(i,item){
            temp=loc.replace("/","");
            console.log(temp);
            console.log(item.id);
            if(item.id==id){
                locName=item.name;
            }
        });
        address=warehouseName+"/"+locName;
    }
    else{
        loc=localStorage.getItem("location");
        id=param.id;
        id=id.replace("back","");
        address=loc+"/"+id;
        console.log(address);
        localStorage.setItem("location",address);
        temp=loc.split("/")
        warehouseName=""
        level=""
        $.each(warehouses,function(i,item){
            if(item.id==temp[1]){
                level=item.level;
                warehouseName=item.name;
                return false
            }
        })
        pallotName=""
        temp2=address.at(-1)
        $.each(locations,function(i,item){
            if(item.id==temp2){
                pallotName=item.name;
                console.log(item.name);
                return false
            }
        })
        locName="";
        $.each(locations,function(i,item){
            temp=loc.replace("/","");
            console.log(temp);
            console.log(item.id);
            if(item.id==id){
                locName=item.name;
            }
        });
        address=warehouseName+"/"+locName+"/"+pallotName
    }
    console.log(id);
    document.getElementById("content").innerHTML="";
    $content=$("#content");
    $content.append('<h6 style="margin-bottom:10px">Pallots</h6>');
    $content.append('<h6 id="title">'+'AJCL/'+address+'</h6><br>');
    $content.append('<span id="back'+id+'" onclick="goToLocations(this)" class="back fa fa-reply fa-7x mr-3"><p>Back</p></span>');
    // $content.append('<div class="warehouse"><span class="fa fa-plus fa-7x mr-3"></span><a onclick=""><p style="text-align:left;">Pallot</p></a></div>');
    $content.append('<div class="warehouses" id="businesses"></div>')
    $businesses=$("#businesses");
    $.each(pallots,function(i,item){
        color=""
        tempStatus=""
        if(item.status=='partiallyFilled'){color="#ffe30070";tempStatus="Partially Filled"}
        else if(item.status=='fullyFilled'){color="#6ea331b8";tempStatus="Fully Filled"}
        else{tempStatus="Empty"}
        if(item.refferenceId==id){
            if(level=="pallots"){
            html='<div style="background:'+color+';" id="'+item.id+'" onclick="goToPallotInfo(this)" class="location warehouse"><a><p>'+item.name+'<sub>'+tempStatus+'</sub></p></a></div>';
            }
            else{
                html='<div style="background:'+color+';" id="'+item.id+'" onclick="goToBins(this)" class="location warehouse"><a><p>'+item.name+'<sub>'+tempStatus+'</sub></p></a></div>';  
            }
            $businesses.append(html);
        }
    });
}
function goToBins(param){
    loc1=localStorage.getItem("location");
    console.log(param.id);
    localStorage.setItem("location",loc1+"/"+param.id)
    temp=loc1.split("/");
    console.log(loc1);
    // index=loc1.lastIndexOf("/");
    // let [loc,temp]=split(loc1,index)
    // index0=loc.lastIndexOf("/");
    // console.log(loc);
    // let [loc0,temp0]=split(loc,index0)
    // id=temp0.replace("/","");
    // address=loc
    // var tempLoc=loc
    // temp=tempLoc.split("/")
    warehouseName="";
    console.log(temp[1]);
    $.each(warehouses,function(i,item){
        if(item.id==temp[1]){
            warehouseName=item.name;
            console.log(item.name);
            return false
        }
    })
    locationName="";
    temp2=address.at(-1)
    $.each(locations,function(i,item){
        console.log(item.id);
        console.log(id);
        if(item.id==id){
            locationName=item.name;
            console.log(item.name);
            return false
        }
    })
    binName=""
    $.each(pallots,function(i,item){
        if(item.id==param.id){
            binName=item.name;
            return false
        }
    })
    address=warehouseName+"/"+locationName+"/"+binName
    document.getElementById("content").innerHTML="";
    $content=$("#content");
    $content.append('<h6 style="margin-bottom:10px">Bins</h6>');
    $content.append('<h6 id="title">'+address+'</h6><br>');
    $content.append('<span id="back'+param.id+'" onclick="goToPallots(this)" class="back fa fa-reply fa-7x mr-3"><p>Back</p></span>');
    // $content.append('<div class="warehouse"><span class="fa fa-plus fa-7x mr-3"></span><a onclick=""><p style="text-align:left;">Bin</p></a></div>');
    $content.append('<div class="warehouses" id="businesses"></div>')
    $businesses=$("#businesses");
    console.log(id);
    console.log(bins);
    $.each(bins,function(i,item){
        color=""
        tempStatus=""
        if(item.status=='partiallyFilled'){color="#ffe30070";tempStatus="Partially Filled"}
        else if(item.status=='fullyFilled'){color="#6ea331b8";tempStatus="Fully Filled"}
        else{tempStatus="Empty"}
        if(item.refferenceId==param.id){
            html=locationsHtml(item);
            $businesses.append('<div style="background:'+color+';" class="location warehouse"><a onclick=""><p>'+item.sgd+'<sub>'+tempStatus+'</sub></p></a></div>');
        }
    })
}
function goToLocInfoHTML(item){
    var html="<tr><td>"+item.partNo+"</td>"+
    "<td>"+item.name+"</td>"+
    "<td>"+item.quantity+"</td>"
    return html
}
function goToLocInfo(param){
    document.getElementById("content").innerHTML="";
    $content=$("#content");
    data={"location":String(param.id)};
    request=url+'/api/getLocationStorage/';
    postData=JSON.stringify(data);
    loc=localStorage.getItem("location");
    id=param.id;
    address=loc+"/"+id;
    console.log(address);
    localStorage.setItem("location",address);
    temp=loc.split("/")
    warehouseName=""
    $.each(warehouses,function(i,item){
        if(item.id==temp[1]){
            warehouseName=item.name;
            return false
        }
    })
    locName="";
    $.each(locations,function(i,item){
        temp=loc.replace("/","");
        console.log(temp);
        console.log(item.id);
        if(item.id==id){
            locName=item.name;
        }
    });
    address=warehouseName+"/"+locName;
    $content.append('<h6 style="margin-bottom:10px">Pallots</h6>');
    $content.append('<h6 id="title">'+'AJCL/'+address+'</h6><br>');
    $content.append('<span id="back'+param.id+'" onclick="goToLocations(this)" class="back fa fa-reply fa-7x mr-3"><p>Back</p></span>');
    $content.append("<table id='locInfo'><tr><th>Part No</th><th>Nomenclature</th><th>Quantity</th></td></table>");
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'POST',
        url: request,
        data:postData,
        success: function(data){
            $locInfo=$("#locInfo");
            $.each(data["storage"],function(i,item){
                html=goToLocInfoHTML(item);
                $locInfo.append(html);
            });
        }
    });
}
function goToPallotInfoHTML(item){
    var html="<tr><td>"+item.partNo+"</td>"+
    "<td>"+item.name+"</td>"+
    "<td>"+item.quantity+"</td>"
    return html
}
function goToPallotInfo(param){
    document.getElementById("content").innerHTML="";
    $content=$("#content");
    data={"location":String(param.id)};
    request=url+'/api/getPallotStorage/';
    postData=JSON.stringify(data);
    loc=localStorage.getItem("location");
    id=param.id;
    address=loc+"/"+id;
    console.log(address);
    localStorage.setItem("location",address);
    temp=loc.split("/")
    warehouseName=""
    $.each(warehouses,function(i,item){
        if(item.id==temp[1]){
            warehouseName=item.name;
            return false
        }
    })
    locName="";
    $.each(locations,function(i,item){
        temp=loc.replace("/","");
        console.log(temp);
        console.log(item.id);
        if(item.id==id){
            locName=item.name;
        }
    });
    address=warehouseName+"/"+locName;
    $content.append('<h6 style="margin-bottom:10px">Pallots</h6>');
    $content.append('<h6 id="title">'+'AJCL/'+address+'</h6><br>');
    $content.append('<span id="back'+param.id+'" onclick="goToPallots(this)" class="back fa fa-reply fa-7x mr-3"><p>Back</p></span>');
    $content.append("<table id='locInfo'><tr><th>Part No</th><th>Nomenclature</th><th>Quantity</th></td></table>");
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'POST',
        url: request,
        data:postData,
        success: function(data){
            $locInfo=$("#locInfo");
            $.each(data["storage"],function(i,item){
                html=goToPallotInfoHTML(item);
                $locInfo.append(html);
            });
        }
    });
}

function endUsers(){
    localStorage.setItem("location","endUsers");
}
function endUserDetailItemHtml(item){
    html="<div class='endUserDetailItem'><table>"+
    "<tr><td>Inventory Name:</td><td> Panel</td></tr>"+
    "<tr><td>Quantity:</td><td> 0</td></tr>"+
    "<tr><td>Intallation Date:</td><td> 3/3/2022</td></tr>"+
    "<tr><td>Status:</td><td> OK</td></tr></table></div>"
    return html;
}
function goToEndUserDetials(){
    localStorage.setItem("location","endUser");
    document.getElementById("content").innerHTML="";
    $content=$("#content");
    $content.append('<h6 id="title">END USER</h6>');
    $content.append('<span onclick="endUserBack()" class="back fa fa-reply fa-7x mr-3"><p>Back</p></span>');
    $content.append('<div class="endUsers" id="endUsers"></div>')
    $endUser=$("#endUsers")
    data=[0,1,2,3,4,5,6,7,8]
    $.each(data,function(i,item){
        html=endUserDetailItemHtml(item);
        $endUser.append(html);
    })
}
function endUserBack(){
    location.reload()
}
function goToAddWareHouse(){
    location.href="addWarehouse.html"
}
function warehouseLevel(param){
    document.getElementById("partNamesDiv").innerHTML="";
    document.getElementById("pallotNamesDiv").innerHTML="";
    // document.getElementById("binNamesDiv").innerHTML="";
    value=document.getElementById(param.id).value;
    console.log(value);
    if(value=="warehouse"){
        document.getElementById("otherRequirements").innerHTML="";
    }
    else if(value=="parts"){
        document.getElementById("otherRequirements").innerHTML="";
        $row=$("#otherRequirements");
        $row.append('<label>No of Locations: <input type="number" oninput="getPartNames(this)" id="noOfParts" name="noOfParts" placeholder="Enter Total Locations" /></label>');
        $row.append('<label>Size of Locations: <div id="locSizes"></div></label>');
    }
    else if(value=="pallots"){
        document.getElementById("otherRequirements").innerHTML="";
        $row=$("#otherRequirements");
        $row.append('<label>No of Locations: <input type="number" oninput="getPartNames(this)" id="noOfParts" name="noOfParts" placeholder="Enter Total Locations" /></label>');
        $row.append('<label>Size of Locations: <div id="locSizes"></div></label>');
        $row.append('<label>No of Pallots: <div id="allPallots"></label>');
    }
    else if(value=="bins"){
        document.getElementById("otherRequirements").innerHTML="";
        $row=$("#otherRequirements");
        $row.append('<label>No of Locations: <input type="number" oninput="getPartNames(this)" id="noOfParts" name="noOfParts" placeholder="Enter Total Locations" /></label>');
        $row.append('<label>Size of Locations: <div id="locSizes"></div></label>');
        $row.append('<label>No of Pallots: <div id="allPallots"></div></label>');
        // $row.append('<label>No of Bins: <div id="allBins"></div></label>');
    }
    else{
        document.getElementById("otherRequirements").innerHTML="";
    }
}
function loadAddWarehouse(){

}
function addWarehouse(){
    console.log("addWarehouse")
    var name=document.getElementById("name").value;
    var address=document.getElementById("address").value;
    var date=document.getElementById("date").value;
    var select=document.getElementById("level").value;
    var uom=document.getElementById("uom").value;
    var status=true;
    postData={}
    if(name){
        document.getElementById("name").style.borderColor="lightgrey";
        postData["name"]=name;
        if(address){
            document.getElementById("address").style.borderColor="lightgrey";
            postData["address"]=address;
        if(date){
            document.getElementById("date").style.borderColor="lightgrey";
            postData["date"]=date;
            if(uom){
            document.getElementById("uom").style.borderColor="lightgrey";
            postData["uom"]=uom;
            if(select){
                document.getElementById("level").style.borderColor="lightgrey";
                postData["level"]=select;
                if(select=="parts"){
                    if(document.getElementById("noOfParts").value){
                        document.getElementById("noOfParts").style.borderColor="lightgrey";
                        postData["noOfParts"]=document.getElementById("noOfParts").value;
                        for(let i=0;i<parseInt(document.getElementById("noOfParts").value);i++){
                            if(document.getElementById("noOfParts"+i).value){
                                document.getElementById("noOfParts"+i).style.borderColor="lightgrey";
                                postData["noOfParts"+i]=document.getElementById("noOfParts"+i).value;
                            }
                            else{
                                status=false;
                                document.getElementById("noOfParts"+i).style.borderColor="red";
                            }
                        }
                        //Location Size
                        for(let i=0;i<parseInt(document.getElementById("noOfParts").value);i++){
                            if(document.getElementById("locSize"+i).value){
                                document.getElementById("locSize"+i).style.borderColor="lightgrey";
                                postData["locSize"+i]=document.getElementById("locSize"+i).value;
                            }
                            else{
                                status=false;
                                document.getElementById("locSize"+i).style.borderColor="red";
                            }
                        }
                    }
                    else{
                        status=false;
                        document.getElementById("noOfParts").style.borderColor="red";
                    }
                }
                else if(select=="pallots"){
                    parts=document.getElementById("noOfParts").value;
                    // Validating Parts No & Names
                    if(parts){
                        document.getElementById("noOfParts").style.borderColor="lightgrey";
                        postData["noOfParts"]=parts;
                        for(let i=0;i<parseInt(parts);i++){
                            if(document.getElementById("noOfParts"+i).value){
                                document.getElementById("noOfParts"+i).style.borderColor="lightgrey";
                                postData["noOfParts"+i]=document.getElementById("noOfParts"+i).value;
                            }
                            else{
                                status=false;
                                document.getElementById("noOfParts"+i).style.borderColor="red";
                            }
                        }
                    }
                    else{
                        status=false;
                        document.getElementById("noOfParts").style.borderColor="red";
                    }
                    //Validating Locs Sizes
                    if(parts){
                        document.getElementById("noOfParts").style.borderColor="lightgrey";
                        postData["locSize"]=parts;
                        for(let i=0;i<parseInt(parts);i++){
                            if(document.getElementById("locSize"+i).value){
                                document.getElementById("locSize"+i).style.borderColor="lightgrey";
                                postData["locSize"+i]=document.getElementById("locSize"+i).value;
                            }
                            else{
                                status=false;
                                document.getElementById("locSize"+i).style.borderColor="red";
                            }
                        }
                    }
                    else{
                        status=false;
                        document.getElementById("noOfParts").style.borderColor="red";
                    }
                    // Validating Pallots No & Names
                    if(parts){
                        for (let j = 0; j < parseInt(parts); j++) {
                            noOfPallots=parseInt(document.getElementById("noOfPallots"+j).value);
                            if(noOfPallots){
                                document.getElementById("noOfPallots"+j).style.borderColor="lightgrey";
                                postData["noOfPallots"+j]=noOfPallots;
                                for (let i = 0; i < noOfPallots; i++) {
                                    temp=document.getElementById("p"+String(j)+"pn"+String(i)).value;
                                    if(temp){
                                        document.getElementById("p"+String(j)+"pn"+String(i)).style.borderColor="lightgrey";
                                        postData["p"+String(j)+"pn"+String(i)]=temp;
                                    }
                                    else{
                                        status=false;
                                        document.getElementById("p"+String(j)+"pn"+String(i)).style.borderColor="red";
                                    }
                                }
                            }
                            else{
                                document.getElementById("noOfPallots"+j).style.borderColor="red";
                                status=false;
                            }
                            }
                    }
                    else{
                        document.getElementById("noOfParts").style.borderColor="red";
                        status=false;
                    }   
                }
                else if(select=="bins"){
                    parts=document.getElementById("noOfParts").value;
                    // Validating Parts No & Names
                    if(parts){
                        document.getElementById("noOfParts").style.borderColor="lightgrey";
                        postData["noOfParts"]=parts;
                        for(let i=0;i<parseInt(parts);i++){
                            if(document.getElementById("noOfParts"+i).value){
                                document.getElementById("noOfParts"+i).style.borderColor="lightgrey";
                                postData["noOfParts"+i]=document.getElementById("noOfParts"+i).value;
                            }
                            else{
                                status=false;
                                document.getElementById("noOfParts"+i).style.borderColor="red";
                            }
                        }
                        //Validating Locs Sizes
                        document.getElementById("noOfParts").style.borderColor="lightgrey";
                        postData["locSize"]=parts;
                        for(let i=0;i<parseInt(parts);i++){
                            if(document.getElementById("locSize"+i).value){
                                document.getElementById("locSize"+i).style.borderColor="lightgrey";
                                postData["locSize"+i]=document.getElementById("locSize"+i).value;
                            }
                            else{
                                status=false;
                                document.getElementById("locSize"+i).style.borderColor="red";
                            }
                        }
                    // Validating Pallot No & Names
                        for (let j = 0; j < parseInt(parts); j++) {
                            noOfPallots=parseInt(document.getElementById("noOfPallots"+j).value);
                            if(noOfPallots){
                                document.getElementById("noOfPallots"+j).style.borderColor="lightgrey";
                                postData["noOfPallots"+j]=noOfPallots;
                                for (let i = 0; i < noOfPallots; i++) {
                                    temp=document.getElementById("p"+String(j)+"pn"+String(i)).value;
                                    if(temp){
                                        document.getElementById("p"+String(j)+"pn"+String(i)).style.borderColor="lightgrey";
                                        postData["p"+String(j)+"pn"+String(i)]=temp;
                                    }
                                    else{
                                        status=false;
                                        document.getElementById("p"+String(j)+"pn"+String(i)).style.borderColor="red";
                                    }
                                }
                            }
                            else{
                                document.getElementById("noOfPallots"+j).style.borderColor="red";
                                status=false;
                            }
                            }
                    //Bin Quantity
                    for (let j = 0; j < parseInt(parts); j++) {
                        noOfPallots=parseInt(document.getElementById("noOfPallots"+j).value);
                        if(noOfPallots){
                            document.getElementById("noOfPallots"+j).style.borderColor="lightgrey";
                            // for (let i = 0; i < noOfPallots; i++) {
                            //     temp=document.getElementById("pn"+String(j)+"noOfBins"+String(i)).value;
                            //     if(temp){
                            //         document.getElementById("pn"+String(j)+"noOfBins"+String(i)).style.borderColor="lightgrey";
                            //         postData["pn"+String(j)+"noOfBins"+String(i)]=temp;
                            //     }
                            //     else{
                            //         status=false;
                            //        // document.getElementById("pn"+String(j)+"noOfBins"+String(i)).style.borderColor="red";
                            //     }
                            // }
                        }
                        else{
                            document.getElementById("noOfPallots"+j).style.borderColor="red";
                            status=false;
                        }
                    }
                }
                else{
                    document.getElementById("noOfParts").style.borderColor="red";
                    status=false;
                }
                    
            }
            else{
                status=false;
                document.getElementById("level").style.boder="1px solid";
                document.getElementById("level").style.borderColor="red";
            }
            }
            else{
                status=false;
                document.getElementById("level").style.boder="1px solid";
                document.getElementById("level").style.borderColor="red";
            }
            }
            else{
                status=false;
                document.getElementById("uom").style.boder="1px solid";
                document.getElementById("uom").style.borderColor="red";
                document.getElementById("name").style.borderColor="lightgrey";
                document.getElementById("date").style.borderColor="lightgrey";
            }
        }
        else{
            status=false;
            document.getElementById("date").style.boder="1px solid";
            document.getElementById("date").style.borderColor="red";
            document.getElementById("name").style.borderColor="lightgrey";
        }
        }
        else{
            status=false;
            document.getElementById("address").style.boder="1px solid";
            document.getElementById("address").style.borderColor="red";
        }   
    }
    else{
        status=false;
        document.getElementById("name").style.boder="1px solid";
        document.getElementById("name").style.borderColor="red";
    }
    if(status){
        postData=JSON.stringify(postData);
        console.log(postData);
        console.log(postData)
        request=url+'/api/wms/addWarehouse';
        $.ajax({
            headers: {
                'Content-Type': 'application/json'
            },
            type: 'POST',
            url: request,
            data:postData,
            success: function(data){
                if(data["response"]=="exist"){
                    alert("Warehouse Already Exist!");
                }
                else{
                    alert("Warehouse Successfully Added");
                    console.log(data);
                    window.location.href="warehouses.html"
                }
            }
        });
    }
}
function getPartNames(param){
    try{document.getElementById("allPallots").innerHTML="";}
    catch{}
    // try{document.getElementById("allBins").innerHTML="";}
    // catch{}
    try{document.getElementById("partNamesDiv").innerHTML="";}
    catch{}
    try{document.getElementById("pallotNamesDiv").innerHTML="";}
    catch{}
    try{document.getElementById("noOfPallots").value="";}
    catch{}
    try{document.getElementById("locSizes").innerHTML="";}
    catch{}
    // try{document.getElementById("binNamesDiv").innerHTML="";}
    // catch{}
    try{}//document.getElementById("noOfBins").value="";}
    catch{}
    $row=$("#partNamesDiv");
    for (let i = 0; i < parseInt(document.getElementById(param.id).value); i++) {
        $row.append('<input type="text" id="'+param.id+String(i)+'" name="pn'+String(i)+'" placeholder="Enter Location '+String(parseInt(i)+1)+' Name" />')
    }
    $row2=$("#allPallots");
    for (let i = 0; i < parseInt(document.getElementById(param.id).value); i++) {
        $row2.append('<input type="number" oninput="getPallotNames(this)" id="noOfPallots'+String(i)+'" name="noOfPallots'+String(i)+'" placeholder="Enter Location '+String(parseInt(i)+1)+' Pallots Quantity" />')
    }
    $row3=$("#pallotNamesDiv");
    for (let i = 0; i < parseInt(document.getElementById(param.id).value); i++) {
        try{
            document.getElementById("pallotNamesDiv"+i+"Name").remove();
            document.getElementById("pallotNamesDiv"+i).remove();
        }
        catch{}
        $row3.append('<label id="pallotNamesDiv'+i+'Name">Location '+String(parseInt(i)+1)+' Pallot Names</label>');
        $row3.append('<div class="getNames" id="pallotNamesDiv'+i+'"></div>');
    }
    $row4=$("#locSizes");
    for (let i = 0; i < parseInt(document.getElementById(param.id).value); i++) {
        $row4.append('<input type="number" id="locSize'+String(i)+'" name="locSizes'+String(i)+'" placeholder="Enter Location '+String(parseInt(i)+1)+' Size" />')
    }
}
function getPallotNames(param){
    temp=param.id;
    j=temp.replace("noOfPallots","");
    // try{document.getElementById("allBins"+j).innerHTML="";}
    // catch{
    //     $temp=$("#allBins");
    //     $temp.append("<div id='allBins"+j+"'></div>");
    // }
    document.getElementById("pallotNamesDiv"+j).innerHTML="";
    noOfPallots=parseInt(document.getElementById(param.id).value);
    // Generating Pallot Names Fields
    $row=$("#pallotNamesDiv"+j);
    for (let i = 0; i < noOfPallots; i++) {
        $row.append('<input type="text" id="p'+String(j)+'pn'+String(i)+'" name="p'+String(j)+'pn'+String(i)+'" placeholder="Enter Location '+String(parseInt(j)+1)+' Pallot '+String(parseInt(i)+1)+' Name/Number" />')
    }
    if(noOfPallots%3==0){}
    else if(noOfPallots%3==2){
        $row.append('<div></div>');
    }
    else if(noOfPallots%3==1){
        $row.append('<div></div><div></div>');
    }
    else{}
    // $row2=$("#allBins"+j);
    // console.log(j);
    // $row2.append('<div id="allBins'+String(j)+'">');
    // $row2.append('<label>Location '+String(parseInt(j)+1)+' Pallots/Bins</label>');
    // for (let i = 0; i < noOfPallots; i++) {
    //     $row2.append('<input type="number" id="pn'+j+'noOfBins'+String(i)+'" name="noOfBins'+String(i)+'" placeholder="Enter Pallot '+String(parseInt(i)+1)+' Bin Quantity" />')
    // }
    // $row2.append('</div>');
}
function addPart(param){
    localStorage.setItem("addPartLoc",param.id);
    document.getElementById("addResourceModaL").style.display="block";
    document.getElementById("addResourceModaL").style.opacity="1";
    document.getElementById("content").style.filter="blur(2px)";
    document.getElementById("popupHead").innerHTML="Add Location";
    $row=$("#popupBody");
    document.getElementById("popupBody").innerHTML="";
    $row.append("<input type='text' id='newPartName' placeholder='Enter Location Name'>");
    $row.append("<input type='text' id='locSize' placeholder='Enter Location Size'>");
    $row.append("<button onclick='addPartSubmit()'>Add</button>")
}
function closeAddResourceModaL(){
    document.getElementById("addResourceModaL").style.display="none";
    document.getElementById("addResourceModaL").style.opacity="0";
    document.getElementById("content").style.filter="blur(0px)";
}
function addPartSubmit(){
    request=url+'/api/wms/addLocation/'
    data={"name":document.getElementById("newPartName").value,"size":document.getElementById("locSize").value,"loc":localStorage.getItem("addPartLoc")}
    postData=JSON.stringify(data);
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'POST',
        url: request,
        data:postData,
        success: function(data){
        alert("Location Added Successfully");
        document.getElementById("addResourceModaL").style.display="none";
        document.getElementById("addResourceModaL").style.opacity="0";
        location.reload();
    }});
}
function addPallot(){
    localStorage.setItem("addPartLoc",param.id);
    document.getElementById("addResourceModaL").style.display="block";
    document.getElementById("addResourceModaL").style.opacity="1";
    document.getElementById("content").style.filter="blur(2px)";
    document.getElementById("popupHead").innerHTML="Add Location";
    $row=$("#popupBody");
    document.getElementById("popupBody").innerHTML="";
    $row.append("<input type='text' id='newPartName' placeholder='Enter Location Name'>");
    $row.append("<input type='text' id='locSize' placeholder='Enter Location Size'>");
    $row.append("<button onclick='addPartSubmit()'>Add</button>");
}
existingPallotNo=[]
existingSerialNo=[]
existingEquipSerailNo=[]
function stockInFormLoad(){
    request=url+"/api/getBusinessTypes/";
    localStorage.setItem("warehouse","");
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'GET',
        url: request,
        success: function(data){
            $businessType=$("#businessTypes")
            $.each(data["businessType"],function(i,item){
                $businessType.append("<option value='"+item+"'>"+item+"</option>");
            })
            $warehouse=$("#warehouse")
            $.each(data["warehouses"],function(i,item){
                $warehouse.append("<option value='"+item.id+"|"+item.level+"'>"+item.name+"</option>");
            })
        }
    });
    request=url+"/api/existingUIMSerialNos/";
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'GET',
        url: request,
        success: function(data){
            $.each(data["pallots"],function(i,item){
                existingPallotNo.push(item);
            });
            $.each(data["serialNos"],function(i,item){
                existingSerialNo.push(item);
            });
        }
    });
    request=url+"/api/existingEquipSerialNos/";
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'GET',
        url: request,
        success: function(data){
            $.each(data["serialNos"],function(i,item){
                existingEquipSerailNo.push(item);
            });
        }
    });
}
stockInItemsList=[]
function getBomDataStockIn(){
    console.log("access");
    request=url+"/api/getBussinessTypeBom/"+document.getElementById("businessTypes").value;
    document.getElementById("loader").style.display="block";
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'GET',
        url: request,
        success: function(data){
            console.log(data);
            $allItem1=$("#allItems1");
            $allItem2=$("#allItems2");
            html1="";
            html2="";
            $.each(data["response"],function(i,item){
                if(item.type=="UIM"){
                    html1=html1+"<option onclick='addUIMItem()' id='uim"+item.partNo+"' value='"+item.partNo+"'>"+item.nomenclature+" | "+item.nsn+" | "+item.supplier+"</option>";
                }
                else{
                    html2=html2+"<option onclick='addEquipmentItem()'id='equ"+item.partNo+"' value='"+item.partNo+"'>"+item.nomenclature+" | "+item.nsn+" | "+item.supplier+"</option>";
                }
                stockInItemsList.push(item);
            });
            document.getElementById("allItems1").innerHTML=html1;
            document.getElementById("allItems2").innerHTML=html2;
            document.getElementById("loader").style.display="none";
        }
    });
}
var selectedUIM=[]
function addUIMItemHTML(item){
    html='<div class="itemDetails uimStockDetail" id="itemDiv'+item.id+'">'+
        '<div><p id="partNo'+item.id+'">'+item.partNo+'</p></div>'+
        '<div><p id="nomenclature'+item.id+'">'+item.nomenclature+'</p></div>'+
        '<div><p>'+item.nsn+'</p></div>'+
        //'<div><p><input style="margin-top:0px;" type="number" id="qtyUIM'+item.id+'" min="0" placeholder="Enter Quantity"></p></div>'+
        '<div><input onchange="addUIMPallotsLocStep1(this)" type="file" id="uimFile'+item.id+'" accept=".xlsx"></div>'+
        '<div><span class="fa fa-minus fa-3x removeItem" onclick="onclickRemoveUIMItem(this)" id="removeItem'+item.id+'"></span></div>'+
        '</div>'
    return html
}
function addUIMItem(partNo){
    console.log(partNo);
    var status=false;
    noOfPallot=document.getElementById("noOfPallot").value;
    if(noOfPallot){
        if(selectedUIM.includes(partNo)){
            alert("Item Already Added!");
            document.getElementById("addUIMItem").value="";
        }
        else{
            if(selectedUIM.length>=parseInt(noOfPallot)){
                alert(String(noOfPallot)+" Items Already Selected!");
            }
            else{
            document.getElementById("loader").style.display="block";
            $row=$("#uimItems");
            $.each(stockInItemsList,function(i,item){
                if(item.partNo==partNo){
                    var html=addUIMItemHTML(item)
                    $row.append(html);
                    selectedUIM.push(item.id);
                    document.getElementById("loader").style.display="none";
                    document.getElementById("addUIMItem").value="";
                    // document.getElementById("equ"+partNo).remove();
                    status=true;
                    return false;
                }
            });
            if(status){
                document.getElementById("loader").style.display="none";
            }else{}
        }
        }
    }
    else{
        alert("Add No of Pallots First!");
        document.getElementById("addUIMItem").value="";
    }
}

var selectedEquip=[]
function addEquipItemHTML(item){
    html='<div class="itemDetails uimStockDetail" id="itemDiv'+item.id+'">'+
        '<div><p id="partNoEquipment'+item.id+'">'+item.partNo+'</p></div>'+
        '<div id="nomenclatureEquipment'+item.id+'"><p>'+item.nomenclature+'</p></div>'+
        '<div><p>'+item.nsn+'</p></div>'+
        //'<div><p><input style="margin-top:0px;" type="number" id="qtyEquipment'+item.id+'" min="0" placeholder="Enter Quantity"></p></div>'+
        '<div><input onchange="adEquipmentPallotsLocStep1(this)" type="file" id="equipmentFile'+item.id+'" accept=".xlsx"></div>'+
        '<div><span onclick="onclickRemoveEquipmentItem(this)" class="fa fa-minus fa-3x removeItem" id="removeItem'+item.id+'"></span></div>'+
        '</div>'
    return html;
}
function addEquipItem(partNo){
    console.log(partNo);
    var status=false;
    noOfEquipment=document.getElementById("noOfEquipment").value;
    if(noOfEquipment){
        if(selectedEquip.includes(partNo)){
            alert("Item Already Added!");
            document.getElementById("addEquipmentItem").value="";
        }
        else{
            if(selectedEquip.length>=parseInt(noOfEquipment)){
                alert(String(noOfEquipment)+" Items Already Selected!");
            }
            else{
                document.getElementById("loader").style.display="block";
                $row=$("#equipmentItems");
                $.each(stockInItemsList,function(i,item){
                    if(item.partNo==partNo){
                        var html=addEquipItemHTML(item);
                        $row.append(html);
                        selectedEquip.push(item.id);
                        document.getElementById("loader").style.display="none";
                        document.getElementById("addEquipmentItem").value="";
                        status=true;
                        return false;
                    }
            });
            if(status){
                document.getElementById("loader").style.display="none";
            }else{}
        }
        }
    }
    else{
        alert("Add No of Equipments First!");
        document.getElementById("addEquipmentItem").value="";
    }
}
pallots=[]
locations=[]
uimSerialNos=[]
uimPallotNos=[]
equipments=[]
equipmentsLocations=[]
equipmentsPallots=[]
equipmentsBins=[]
equipmentSerialNos=[]
pallotWithBoxId={}

function addUIMLocHTML(id,i,pallotNo,qty){
    level=localStorage.getItem("level");
    if(level=="bins" || level=="pallots"){
    html='<div class="addLocations">'+
    '<div>'+String(parseInt(i)+1)+'</div>'+
    '<div><p id="uimItemPallotOrg'+id+'item'+i+'">'+pallotNo+'</p></div>'+
    '<div><p id="uimItemPallotQty'+id+'item'+i+'">'+qty+'</p></div>'+
    '<div><select onchange="selectUIMItemLoc(this)" id="uimItemLoc'+id+'item'+i+'"><option value="">Select</option></select></div>'+
    '<div><select id="uimItemPallot'+id+'item'+i+'" onchange="selectUIMItemPallot(this)"><option value="">Select</option></select></div>'+
  '</div>'}
  else{
    html='<div class="addLocations">'+
    '<div>'+String(parseInt(i)+1)+'</div>'+
    '<div><p id="uimItemPallotOrg'+id+'item'+i+'">'+pallotNo+'</p></div>'+
    '<div><p id="uimItemPallotQty'+id+'item'+i+'">'+qty+'</p></div>'+
    '<div><select onchange="selectUIMItemLoc(this)" id="uimItemLoc'+id+'item'+i+'"><option value="">Select</option></select></div>'+
    // '<div><select id="uimItemPallot'+id+'item'+i+'" onchange="selectUIMItemPallot(this)"><option value="">Select</option></select></div>'+
  '</div>'
  }
  return html;
}
function addUIMPallotsLocStep1(param){
    var files = $('#'+param.id)[0].files;
    tempId=param.id;
    tempId=tempId.replace("uimFile","");
    localStorage.setItem("locationSelectedItem",tempId);
        if(files.length > 0 ){
            localStorage.setItem("modalId",param.id);
            document.getElementById("addItemLoc").style.display="block";
            document.getElementById("addItemLoc").style.opacity="1";
            document.getElementById("form").style.filter="blur(5px)"
            $("#continue").attr("onclick","addUIMItemWithLoc()");
            uploadUIMProcess(String(param.id));
        }
        else{
            alert("Please Select Serialization File!");
        }
}
uimSelectPallots=[]
function selectUIMItemLoc(param){
    level=localStorage.getItem("level");
    if(level=="bins" || level=="pallots"){
        loc=document.getElementById(param.id).value;
        if(loc){
            id=param.id;
            id=id.replace("uimItemLoc","uimItemPallot");
            document.getElementById(id).innerHTML="";
            $row=$("#"+id);
            $row.append('<option value="">Select</option>')
            $.each(pallots,function(i,item){
                if(item.refferenceId==loc){
                    const index = uimSelectPallots.indexOf(String(item.id));
                    console.log(index);
                    if (index > -1){}
                    else{
                        $row.append('<option value="'+item.id+'">'+item.name+'</option>');
                    }
                }else{}
            });
        }
        else{}
    }
    else{}
}
function selectUIMItemPallot(param){
    pallot=document.getElementById(param.id).value;
    uimSelectPallots.push(String(document.getElementById(param.id).value));
    id=param.id;
    id=id.split("item");
    for(let i=0;i<uniquePallotsIds.length;i++){
        temp=id[0]+"item"+i;
        console.log(temp);
        if(param.id==temp){}
        else{
            $("#"+temp+" option[value='"+pallot+"']").remove();
        }
    }
}
function selectWarehouseAddStock(){
    warehouse=document.getElementById("warehouse").value;
    if(warehouse){
    document.getElementById("allItemDetails").style.display="block";
    temp=warehouse.split("|");
    console.log(temp);
    localStorage.setItem("warehouse",temp[0]);
    localStorage.setItem("level",temp[1]);
    }
    else{document.getElementById("allItemDetails").style.display="none";}
}
function instantAddItemLocClose(){
    temp=localStorage.getItem("currentModelType");
    if(temp=="equipment"){
        temp2=localStorage.getItem("runningItem");
        $.each(JSON.parse(temp2),function(i,item){
            index = equipmentSerialNos.indexOf(item);
            if (index > -1) { // only splice array when item is found
                equipmentSerialNos.splice(index, 1); // 2nd parameter means remove one item only
            }
        })
    }
    else if(temp=="uim"){
        temp2=localStorage.getItem("runningItem");
        $.each(JSON.parse(temp2),function(i,item){
            delete pallotWithBoxId[item];
        });
    }
    else{}
    addItemLocClose()
}
function addItemLocClose(){
    document.getElementById("addItemLoc").style.display="none";
    document.getElementById("addItemLoc").style.opacity="0";
    document.getElementById("form").style.filter="blur(0px)";
    document.getElementById(localStorage.getItem("modalId")).value="";
    document.getElementById("modalContent").innerHTML="";
    Object.keys(uimPallotNos).length === 0;
    Object.keys(uimSerialNos).length === 0;
    Object.keys(selectedUIMLocs).length === 0;
    Object.keys(uniquePallots).length === 0;
    Object.keys(uniquePallotsIds).length === 0;
    Object.keys(locations).length === 0;
    Object.keys(pallots).length === 0;
    Object.keys(equipments).length === 0;
    Object.keys(equipmentsLocations).length === 0;
    Object.keys(equipmentsPallots).length === 0;
    Object.keys(equipmentsBins).length === 0;
    Object.keys(equipmentSerialNos).length === 0;
    uimPallotNos.length=0;
    uimSerialNos.length=0;
    selectedUIMLocs.length=0;
    uniquePallots.length=0;
    uniquePallotsIds.length=0;
    locations.length=0;
    pallots.length=0;
    equipments.length=0;
    equipmentsLocations.length=0;
    equipmentsPallots.length=0;
    equipmentsBins.length=0;
    equipmentSerialNos.length=0;
}
function onclickRemoveUIMItem(param){
    id=param.id;
    id=id.replace("removeItem","");
    document.getElementById("itemDiv"+id).remove();
    const index = selectedUIM.indexOf(parseInt(id));
    if (index > -1) {
        selectedUIM=selectedUIM.splice(index, 1);
    }else{}
    console.log(selectedUIM);
}
selectedUIMLocs=[]
function addSeelectedUIMLocs(){
    // id="uimItemLoc'+id+'item'+i+'"
    // id="uimItemPallot'+id+'item'+i+'"
    // id="qtyUIM'+item.id+'"
    id=localStorage.getItem("locationSelectedItem");
    // qty=document.getElementById("qtyUIM"+id).value;
    // document.getElementById("qtyUIM"+id).readOnly=true;
    for(let i=0;i<uniquePallotsIds.length;i++){
        loc=document.getElementById("uimItemLoc"+id+"item"+i).value;
        pallot=document.getElementById("uimItemPallot"+id+"item"+i).value;
        temp={"id":id,"iitem":i,"loc":loc,"pallot":pallot}
        selectedUIMLocs.push(temp);
    }
    console.log(selectedUIMLocs);
    addItemLocClose();
}

//READ UIM EXCEL FILE START
function uploadUIMProcess(id) {
    //Reference the FileUpload element.
    var fileUpload = document.getElementById(id);

    //Validate whether File is valid Excel file.
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;
    if (regex.test(fileUpload.value.toLowerCase())) {
        if (typeof (FileReader) != "undefined") {
            var reader = new FileReader();

            //For Browsers other than IE.
            if (reader.readAsBinaryString) {
                reader.onload = function (e) {
                    getUIMDataFromExcel(e.target.result,id);
                };
                reader.readAsBinaryString(fileUpload.files[0]);
            } else {
                //For IE Browser.
                reader.onload = function (e) {
                    var data = "";
                    var bytes = new Uint8Array(e.target.result);
                    for (var i = 0; i < bytes.byteLength; i++) {
                        data += String.fromCharCode(bytes[i]);
                    }
                    getUIMDataFromExcel(data,id);
                };
                reader.readAsArrayBuffer(fileUpload.files[0]);
            }
        } else {
            alert("This browser does not support HTML5.");
        }
    } else {
        alert("Please upload a valid Excel file.");
    }
};

function getUIMDataFromExcel(data,id) {
    //Read the Excel File data in binary
    var workbook = XLSX.read(data, {
        type: 'binary'
    });

    //get the name of First Sheet.
    var Sheet = workbook.SheetNames[0];

    //Read all rows from First Sheet into an JSON array.
    var excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[Sheet]);
    if(excelRows[0].boxId){
    //Add the data rows from Excel file.
    tempStatus=false;
    duplicatePallots=[]
    duplicateBoxID=[]
    currentUploadingSerialNos=[]
    currentUploadingPallotNos=[]
    currentUploaded=[]
    for (var i = 0; i < excelRows.length; i++) {
        console.log(excelRows[i]);
        validator1=existingPallotNo.includes(String(excelRows[i].palletNo));
        validator2=existingSerialNo.includes(String(excelRows[i].boxId));
        validator2a=currentUploadingSerialNos.includes(String(excelRows[i].boxId));
        console.log(validator1);
        console.log(validator2);
        console.log(validator2a);
        if(validator1){
            duplicatePallots.push(String(excelRows[i].palletNo));
            tempStatus=true;
        }
        else{
            if(validator2){
                tempStatus=true;
                duplicateBoxID.push(String(excelRows[i].boxId));
            }
            else if(validator2a){
                tempStatus=true;
                duplicateBoxID.push(String(excelRows[i].boxId));
            }
            else{
                console.log("in");
                try{
                    currentUploaded[excelRows[i].palletNo].push(String(excelRows[i].boxId));
                }
                catch(e){
                    try{
                        temp=currentUploaded[String(excelRows[i].palletNo)];
                        currentUploaded[excelRows[i].palletNo].push(String(excelRows[i].boxId));
                    }
                    catch(e){
                        currentUploaded[excelRows[i].palletNo]=[String(excelRows[i].boxId)];
                    }
                }
                currentUploadingPallotNos.push(String(excelRows[i].palletNo));
                currentUploadingSerialNos.push(String(excelRows[i].boxId));
                uimSerialNos.push(String(excelRows[i].boxId));
                uimPallotNos.push(String(excelRows[i].palletNo));
            }
        }
    }
    if(tempStatus){
        console.log("DuplicatesFound")
        alert("Following pallot numbers are duplicate: "+String(duplicatePallots)+". Following Box Id are duplicate: "+String(duplicateBoxID));
        alert("Please Remove Duplicates and then again upload files");
        // $.each(currentUploadingPallotNos,function(i2,item2){
        //     delete pallotWithBoxId[item2];
        // });
        console.log(excelRows);
        uimPallotNos.length=0;
        uimSerialNos.length=0;
        selectedUIMLocs.length=0;
        uniquePallots.length=0;
        uniquePallotsIds.length=0;
        locations.length=0;
        pallots.length=0;
        equipments.length=0;
        equipmentsLocations.length=0;
        equipmentsPallots.length=0;
        equipmentsBins.length=0;
        equipmentSerialNos.length=0;
        document.getElementById("addItemLoc").style.display="none";
        document.getElementById("addItemLoc").style.opacity="0";
        document.getElementById("form").style.filter="blur(0px)";
    }
    else{
        console.log(currentUploadingPallotNos);
        tempKeys=Object.keys(currentUploaded);
        console.log(currentUploaded);
        console.log(tempKeys);
        $.each(tempKeys,function(i,item){
            pallotWithBoxId[item]=currentUploaded[item];
        });
        console.log(pallotWithBoxId);
        // try{
        //     pallotWithBoxId[excelRows[i].palletNo].push(String(excelRows[i].boxId));
        // }
        // catch(e){
        //     try{
        //         temp=pallotWithBoxId[String(excelRows[i].palletNo)];
        //     }
        //     catch(e){
        //         pallotWithBoxId[excelRows[i].palletNo]=[String(excelRows[i].boxId)];
        //     }
        // }
        console.log("Uploaded!")
        localStorage.setItem("currentModelType","uim");
        localStorage.setItem("runningItem",JSON.stringify(currentUploadingPallotNos));
        localStorage.setItem("runningItemSerialNos",JSON.stringify(currentUploadingSerialNos));
        addUIMPallotsLocStep2(id);
    }
    }
    else{
        alert("Invalid File!");
        document.getElementById("addItemLoc").style.display="none";
        document.getElementById("addItemLoc").style.opacity="0";
        document.getElementById("form").style.filter="blur(0px)";
    }
}

//READ EXCEL FILE END
uniquePallots={}
uniquePallotsIds=[]
function addUIMPallotsLocStep2(param){
    warehouse=localStorage.getItem("warehouse");
    pallotNos=[];
            console.log(uimPallotNos.length);
            $.each(uimPallotNos,function(i,item){
                console.log(item);
                let index = pallotNos.indexOf(item);
                if(index>-1){}
                else{
                    pallotNos.push(item);
                    uniquePallots[item]=[];
                    uniquePallotsIds.push(item.id);
                }
            });
            console.log(uniquePallotsIds);
            console.log(pallotNos);
            tempStatus2=false
            for(let i=0;i<uimPallotNos.length;i++){
                tempStatus=true;
                $.each(pallotNos,function(j,item){
                    let index=uniquePallots[item].indexOf(uimSerialNos[i])
                    if(index>-1){tempStatus=false}
                    else{}
                });
                if(tempStatus){
                    uniquePallots[uimPallotNos[i]].push(uimSerialNos[i]);
                }
                else{
                    tempStatus2=true;
                    alert(String(uimSerialNos[i])+" serial. Duplication Found!");
                }
            }
            console.log(uniquePallots);
            if(tempStatus2){
                alert("Please remove the duplication first and then upload again!");
                Object.keys(uimSerialNos).length === 0;
                uimSerialNos.length=0;
                console.log(uimSerialNos);
                Object.keys(uimPallotNos).length === 0;
                uimPallotNos.length=0;
                console.log(uimPallotNos);
                addItemLocClose();
                console.log("Printing");
                // console.log(pallotWithBoxId);
                // console.log(equipmentSerialNos);
                // console.log(equipmentsBins);
                // console.log(equipmentsPallots);
                // console.log(equipmentsLocations);
                // console.log(equipments);
                // console.log(uimPallotNos);
                // console.log(uimSerialNos);
                // console.log(locations);
                // console.log(pallots);
            }
            else{
            console.log(warehouse);
            request=url+"/api/uimPallots/"+warehouse;
            $.ajax({
                headers: {
                    'Content-Type': 'application/json'
                },
                type: 'GET',
                url: request,
                success: function(data){
                    console.log(data);
                    $.each(data["locations"],function(i,item){
                        locations.push(item);
                    });
                    $.each(data["pallots"],function(i,item){
                        pallots.push(item);
                    });
                console.log(param);
                id=param.replace("uimFile","");
                // qty=document.getElementById("qtyUIM"+id).value;
                document.getElementById("modalContent").innerHTML="";
                $modalContent=$("#modalContent");
                document.getElementById("addItemLocTitle").innerHTML="Add "+document.getElementById("nomenclature"+id).innerHTML+" Locations";
                level=localStorage.getItem("level");
                console.log(uniquePallotsIds);
                console.log(locations);
                for(let i=0;i<parseInt(uniquePallotsIds.length);i++){
                    pallotNo=pallotNos[i];
                    qty=uniquePallots[pallotNo].length;
                    html=addUIMLocHTML(id,i,pallotNo,qty);
                    $modalContent.append(html);
                    $row=$("#uimItemLoc"+id+'item'+i);
                    $.each(locations,function(j,item){
                        $row.append('<option value="'+item.id+'">'+item.name+'</option>');
                    });
                }
            }
        });}
}

uimItemWithSerialNo=[]
uimItemWithSerialNoTemp=[]
function addUIMItemWithLoc(){
    id=localStorage.getItem("modalId");
    id=id.replace("uimFile","");
    // qty=document.getElementById("qtyUIM"+id).value;
    level=localStorage.getItem("level");
    tempStatus=false;
    tempStorage=[]
    for(let i=0;i<uniquePallotsIds.length;i++){
        console.log(id);
        pallotId=document.getElementById("uimItemPallotOrg"+id+'item'+i).innerHTML;
        pallotItemQty=document.getElementById("uimItemPallotQty"+id+'item'+i).innerHTML;
        loc=document.getElementById("uimItemLoc"+id+'item'+i).value;
        if(loc){
            document.getElementById("uimItemLoc"+id+'item'+i).style.borderColor="lightgrey";
            if(level=="parts"){
                temp={"pallotId":pallotId,"pallotItemQty":pallotItemQty,"loc":loc,"boxId":pallotWithBoxId[pallotId]}
                tempStorage.push(temp);
            }
            else{
                pallot=document.getElementById("uimItemPallot"+id+'item'+i).value;
                if(pallot){
                    document.getElementById("uimItemPallot"+id+'item'+i).style.borderColor="lightgrey";
                    temp={"pallotId":pallotId,"pallotItemQty":pallotItemQty,"loc":loc,"pallot":pallot,"boxId":pallotWithBoxId[pallotId]}
                    tempStorage.push(temp);
                }
                else{
                    tempStatus=true;
                    document.getElementById("uimItemPallot"+id+'item'+i).style.border="1px solid";
                    document.getElementById("uimItemPallot"+id+'item'+i).style.borderColor="red";
                }
            }
        }
        else{
            tempStatus=true;
            document.getElementById("uimItemLoc"+id+'item'+i).style.border="1px solid";
            document.getElementById("uimItemLoc"+id+'item'+i).style.borderColor="red";
        }
    }
    if(tempStatus){}
    else{
        temp1v=localStorage.getItem("runningItem");
        temp2v=localStorage.getItem("runningItemSerialNos");
        $.each(JSON.parse(temp1v),function(i,item){
            existingPallotNo.push(item);
        });
        $.each(JSON.parse(temp2v),function(i,item){
            existingSerialNo.push(item);
        });
        $.each(tempStorage,function(i,item){uimItemWithSerialNoTemp.push(item)});
        uimItemWithSerialNo.push(tempStorage);
        console.log(tempStorage);
        document.getElementById("addItemLoc").style.display="none";
        document.getElementById("addItemLoc").style.opacity="0";
        document.getElementById("form").style.filter="blur(0px)";
        document.getElementById(localStorage.getItem("modalId")).style.display="none";
        document.getElementById("modalContent").innerHTML="";
        document.getElementById("removeItem"+id).style.display="none";
        uimPallotNos.length=0;
        uimSerialNos.length=0;
        selectedUIMLocs.length=0;
        uniquePallots.length=0;
        uniquePallotsIds.length=0;
        locations.length=0;
        pallots.length=0;
        equipments.length=0;
        equipmentsLocations.length=0;
        equipmentsPallots.length=0;
        equipmentsBins.length=0;
        equipmentSerialNos.length=0;
        console.log(uimItemWithSerialNo);
    }
}
// 1234321
// Add Equipment Setup

function addEquipmentLocHTML(id,i,qty,equip){
    level=localStorage.getItem("level");
    if(level=="bins"){
    html='<div class="addLocationsEquipement">'+
    '<div>'+String(parseInt(i)+1)+'</div>'+
    '<div><p id="equip'+id+'item'+i+'">'+equip+'</p></div>'+
    '<div><p id="equipmentItemPallotQty'+id+'item'+i+'">'+qty+'</p></div>'+
    '<div><select onchange="selectEquipmentItemLoc(this)" id="equipmentItemLoc'+id+'item'+i+'"><option value="">Select</option></select></div>'+
    '<div><select id="equipmentItemPallot'+id+'item'+i+'" onchange="selectEquipmentPallot(this)"><option value="">Select</option></select></div>'+
    '<div><select id="equipmentItemNoOfBin'+id+'item'+i+'" onchange="selectEquipmentBin(this)"><option value="">Select</option></select></div>'+
  '</div>'
    }
    else if(level=="pallots"){
        html='<div class="addLocationsEquipement">'+
        '<div>'+String(parseInt(i)+1)+'</div>'+
        '<div><p id="equip'+id+'item'+i+'">'+equip+'</p></div>'+
        '<div><p id="equipmentItemPallotQty'+id+'item'+i+'">'+qty+'</p></div>'+
        '<div><select onchange="selectEquipmentItemLoc(this)" id="equipmentItemLoc'+id+'item'+i+'"><option value="">Select</option></select></div>'+
        '<div><select id="equipmentItemPallot'+id+'item'+i+'" onchange="selectEquipmentPallot(this)"><option value="">Select</option></select></div>'+
        //'<div><select id="equipmentItemNoOfBin'+id+'item'+i+'" onchange="selectEquipmentBin(this)"><option value="">Select</option></select></div>'+
      '</div>'
    }
    else if(level=="parts"){
        html='<div class="addLocationsEquipement">'+
        '<div>'+String(parseInt(i)+1)+'</div>'+
        '<div><p id="equip'+id+'item'+i+'">'+equip+'</p></div>'+
        '<div><p id="equipmentItemPallotQty'+id+'item'+i+'">'+qty+'</p></div>'+
        '<div><select onchange="selectEquipmentItemLoc(this)" id="equipmentItemLoc'+id+'item'+i+'"><option value="">Select</option></select></div>'+
        //'<div><select id="equipmentItemPallot'+id+'item'+i+'" onchange="selectEquipmentPallot(this)"><option value="">Select</option></select></div>'+
        //'<div><select id="equipmentItemNoOfBin'+id+'item'+i+'" onchange="selectEquipmentBin(this)"><option value="">Select</option></select></div>'+
      '</div>'
    }
  return html;
}
function adEquipmentPallotsLocStep1(param){
    var files = $('#'+param.id)[0].files;
    tempId=param.id;
    tempId=tempId.replace("equipmentFile","");
    localStorage.setItem("locationSelectedItem",tempId);
    if(files.length > 0 ){
        localStorage.setItem("modalId",param.id);
        document.getElementById("addItemLoc").style.display="block";
        document.getElementById("addItemLoc").style.opacity="1";
        document.getElementById("form").style.filter="blur(5px)"
        $("#continue").attr("onclick","addEquipmentItemWithSerialNo()");
        uploadEquipmentProcess(String(param.id));
    }
    else{
        alert("Please Select Serialization File!");
    }
}

function onclickRemoveEquipmentItem(param){
    id=param.id;
    id=id.replace("removeItem","");
    document.getElementById("itemDiv"+id).remove();
    const index = selectedEquip.indexOf(id);
    if (index > -1) {
        selectedEquip=selectedEquip.splice(index, 1);
    }else{}
    console.log(selectedEquip);
}
selectedEquipmentLocs=[]
// function addSeelectedEquipmentLocs(){
//     id=localStorage.getItem("locationSelectedItem");
//     qty=document.getElementById("qtyEquipment"+id).value;
//     document.getElementById("qtyEquipment"+id).readOnly=true;
//     for(let i=0;i<parseInt(qty);i++){
//         loc=document.getElementById("uimItemLoc"+id+"item"+i).value;
//         pallot=document.getElementById("uimItemPallot"+id+"item"+i).value;
//         temp={"id":id,"iitem":i,"loc":loc,"pallot":pallot}
//         selectedUIMLocs.push(temp);
//     }
//     console.log(selectedUIMLocs);
//     addItemLocClose();
// }

//READ UIM EXCEL FILE START
function uploadEquipmentProcess(id) {
    //Reference the FileUpload element.
    var fileUpload = document.getElementById(id);

    //Validate whether File is valid Excel file.
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;
    if (regex.test(fileUpload.value.toLowerCase())) {
        if (typeof (FileReader) != "undefined") {
            var reader = new FileReader();

            //For Browsers other than IE.
            if (reader.readAsBinaryString) {
                reader.onload = function (e) {
                    getEquipmentDataFromExcel(e.target.result,id);
                };
                reader.readAsBinaryString(fileUpload.files[0]);
            } else {
                //For IE Browser.
                reader.onload = function (e) {
                    var data = "";
                    var bytes = new Uint8Array(e.target.result);
                    for (var i = 0; i < bytes.byteLength; i++) {
                        data += String.fromCharCode(bytes[i]);
                    }
                    getEquipmentDataFromExcel(data,id);
                };
                reader.readAsArrayBuffer(fileUpload.files[0]);
            }
        } else {
            alert("This browser does not support HTML5.");
        }
    } else {
        alert("Please upload a valid Excel file.");
    }
};

function getEquipmentDataFromExcel(data,id) {
    //Read the Excel File data in binary
    var workbook = XLSX.read(data, {
        type: 'binary'
    });

    //get the name of First Sheet.
    var Sheet = workbook.SheetNames[0];

    //Read all rows from First Sheet into an JSON array.
    var excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[Sheet]);
    if(excelRows[0].serialNo){
    //Add the data rows from Excel file.
    dublicateSerailNo=[]
    tempStatus=false;
    currentSerialNos=[];
    for (var i = 0; i < excelRows.length; i++){
        console.log(excelRows[i]);
        validator1=existingEquipSerailNo.includes(String(excelRows[i].serialNo));
        validator2=currentSerialNos.includes(String(excelRows[i].serialNo));
        if(validator1){
            tempStatus=true;
            dublicateSerailNo.push(String(excelRows[i].serialNo));
        }
        else if(validator2){
            tempStatus=true;
            dublicateSerailNo.push(String(excelRows[i].serialNo));
        }
        else{
            equipmentSerialNos.push(String(excelRows[i].serialNo));
            currentSerialNos.push(String(excelRows[i].serialNo));
        }
    }
    console.log(excelRows);
    if(tempStatus){
        alert("Following serial numbers are dublicate: "+String(dublicateSerailNo));
        alert("Please remove the dublicate and then re-upload!");
        $.each(dublicateSerailNo,function(i2,item2){
            index = equipmentSerialNos.indexOf(item2);
            if (index > -1) { // only splice array when item is found
                equipmentSerialNos.splice(index, 1); // 2nd parameter means remove one item only
            }
        });
        uimPallotNos.length=0;
        uimSerialNos.length=0;
        selectedUIMLocs.length=0;
        uniquePallots.length=0;
        uniquePallotsIds.length=0;
        locations.length=0;
        pallots.length=0;
        equipments.length=0;
        equipmentsLocations.length=0;
        equipmentsPallots.length=0;
        equipmentsBins.length=0;
        equipmentSerialNos.length=0;
        document.getElementById("addItemLoc").style.display="none";
        document.getElementById("addItemLoc").style.opacity="0";
        document.getElementById("form").style.filter="blur(0px)"
    }
    else{
        localStorage.setItem("currentModelType","equipment");
        localStorage.setItem("runningItem",JSON.stringify(currentSerialNos));
        addEquipmentPallotsLocStep2(id);
    }
    }
    else{
        alert("Invalid File!");
        document.getElementById("addItemLoc").style.display="none";
        document.getElementById("addItemLoc").style.opacity="0";
        document.getElementById("form").style.filter="blur(0px)"
    }
}

//READ EXCEL FILE END
uniqueEquipmentSerialNos=[]
tempAddStockBinStorageCount={}
function addEquipmentPallotsLocStep2(param){
    tempStatus=false;
    warehouse=localStorage.getItem("warehouse");
    for(let i=0;i<equipmentSerialNos.length;i++){
        let index=uniqueEquipmentSerialNos.indexOf(String(equipmentSerialNos[i]))
        if(index>-1){tempStatus=true}
        else{uniqueEquipmentSerialNos.push(String(equipmentSerialNos[i]))}
    }
    console.log(uniqueEquipmentSerialNos);
    if(tempStatus){
        alert("Please remove the 'Serial No' duplication first and then upload again. Duplication Found!");
        addItemLocClose();
        Object.keys(equipmentSerialNos).length === 0;
        uimSerialNos.length=0;
    }
    else{
    console.log(uniquePallots);
    console.log(warehouse);
    request=url+"/api/equipmentBins/"+warehouse;
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'GET',
        url: request,
        success: function(data){
            console.log(data);
            tempPallots=[]
            $.each(uimItemWithSerialNoTemp,function(i,item){
                tempPallots.push(item.pallot);
            })
            console.log(tempPallots);
            $.each(data["locations"],function(i,item){
                equipmentsLocations.push(item);
            });
            $.each(data["pallots"],function(i,item){
                console.log(item.id);
                index=tempPallots.indexOf(String(item.id));
                if(index>-1){}
                else{
                    equipmentsPallots.push(item);
                    tempAddStockBinStorageCount[item.id]=0;
                }
            });
            $.each(data["bins"],function(i,item){
                console.log(item.refferenceId);
                index=tempPallots.indexOf(String(item.refferenceId));
                if(index>-1){}
                else{
                    equipmentsBins.push(item);
                    if(parseInt(tempAddStockBinStorageCount[item.refferenceId])<=9){
                    tempAddStockBinStorageCount[item.refferenceId]=parseInt(tempAddStockBinStorageCount[item.refferenceId])+1;
                    }else{}
                }
            });
            console.log(equipmentsPallots);
            id=param.replace("equipmentFile","");
            document.getElementById("modalContent").innerHTML="";
            $modalContent=$("#modalContent");
            document.getElementById("addItemLocTitle").innerHTML="Add "+document.getElementById("nomenclatureEquipment"+id).innerHTML+" Locations";
            $("#modalContent").append("<select onchange='plottingEquipmentType(this)' id='type"+id+"'><option value=''>Select</option><option value='individual'>Individual</option><option value='batchwise'>Batchwise</option></select>")
        }
    });}
}

function plottingEquipmentType(param){
    type=document.getElementById(param.id).value;
    localStorage.setItem("equipPlottingType",type);
    document.getElementById("modalContent").innerHTML="";
    document.getElementById("addItemLocTitle").innerHTML="Add "+document.getElementById("nomenclatureEquipment"+id).innerHTML+" Locations";
    $modalContent=$("#modalContent");
    htmlHeader='<div class="addLocationsEquipement">'+
    '<div></div>'+
    '<div><p>S.No</p></div>'+
    '<div><p>Qty</p></div>'+
    '<div><p>Location</p></div>'+
    '<div><p>Pallot</p></div>'+
    '<div><p>No of Bins</p></div>'+
    '</div>'
    $modalContent.append(htmlHeader);
    id=param.id;
    id=id.replace("type","");
    // qty=document.getElementById("qtyEquipment"+id).value;
    if(type=="individual"){
        localStorage.setItem("equipmentStorage","individual");
        console.log(type);
        console.log(uniqueEquipmentSerialNos.length);
        for(let i=0;i<uniqueEquipmentSerialNos.length;i++){
            equip=uniqueEquipmentSerialNos[i];
            html=addEquipmentLocHTML(id,i,'1',equip);
            console.log(html);
            $modalContent.append(html);
            //$modalContent.append("test");
            $row=$("#equipmentItemLoc"+id+'item'+i);
            $.each(equipmentsLocations,function(j,item){
                $row.append('<option value="'+item.id+'">'+item.name+'</option>');
            });
        }
    }
    else if(type=="batchwise"){
        localStorage.setItem("equipmentStorage","batchwise");
        console.log("batchwise");
        qty=uniqueEquipmentSerialNos.length;
        equip='All Serial No';
        html=addEquipmentLocHTML(id,'all',qty,equip);
        $modalContent.append(html);
        $row=$("#equipmentItemLoc"+id+'item'+'all');
        $.each(equipmentsLocations,function(j,item){
            $row.append('<option value="'+item.id+'">'+item.name+'</option>');
        });
    }
    else{
    
    }
}
selectEquipmentLoc=[]
function selectEquipmentItemLoc(param){
    level=localStorage.getItem("level");
    if(level=="bins" || level=="pallots"){
        loc=document.getElementById(param.id).value;
        if(loc){
            id=param.id;
            id=id.replace("equipmentItemLoc","");
            document.getElementById("equipmentItemPallot"+id).innerHTML="";
            $row=$("#"+"equipmentItemPallot"+id);
            $row.append('<option value="">Select</option>');
            // if(level=="bins"){
            //     document.getElementById("equipmentItemNoOfBin"+id).innerHTML="";
            //     $row2=$("#"+"equipmentItemNoOfBin"+id);
            //     $row2.append('<option value="">Select</option>');
            // }
            // else{}
            count=0
            tempStatus=true;
            $.each(equipmentsPallots,function(i,item){
                if(item.refferenceId==loc){
                    tempStatus=false
                    console.log(tempAddStockBinStorageCount);
                    // if(level=="bins"){
                    //     if(parseInt(tempAddStockBinStorageCount[item.id])>0){
                    //         $row.append('<option value="'+item.id+'">'+item.name+'</option>');
                    //     }else{}
                    // }
                    // else{
                        $row.append('<option value="'+item.id+'">'+item.name+'</option>');
                    // }
                }else{}
            });
            if(tempStatus){
                alert("Location not empty yet!");
                document.getElementById(param.id).value="";
            }
        }
        else{}
    }
    else{}
}
function selectEquipmentPallot(param){
    level=localStorage.getItem("level");
    if(level=="bins"){
        value=document.getElementById(param.id).value;
        id=param.id;
        id=id.replace("equipmentItemPallot","equipmentItemNoOfBin");
        document.getElementById(id).innerHTML="";
        $row2=$("#"+id);
        $row2.append('<option value="">Select</option>')
        for(let i=1;i<=parseInt(tempAddStockBinStorageCount[value]);i++){
        $row2.append('<option value="'+i+'">'+i+'</option>');
        }
    }
    else{}
}
previousBinsQuantity={}
function selectEquipmentBin(param){
    value=document.getElementById(param.id).value;
    id=param.id;
    id=id.replace("equipmentItemNoOfBin","equipmentItemPallot");
    pallot=document.getElementById(id).value;
    try{pv=previousBinsQuantity[param.id]}
    catch{pv=0}
    console.log(tempAddStockBinStorageCount)
    tempAddStockBinStorageCount[pallot]=parseInt(tempAddStockBinStorageCount[pallot])-parseInt(value);
    previousBinsQuantity[param.id]=parseInt(value);
    console.log(value);
    parseInt(value)
    if(localStorage.getItem("equipmentStorage")=="individual"){
        id2=id.split("item");
        for(let i=0;i<uniqueEquipmentSerialNos.length;i++){
            temp=id2[0]+"item"+i;
            if(id==temp){}
            else{
                pallot2=document.getElementById(temp).value;
                temp2=temp.replace("equipmentItemPallot","equipmentItemNoOfBin");
                if(document.getElementById(temp2).value){}
                else{
                    $row2=$("#"+temp2);
                    document.getElementById(temp2).innerHTML="";
                    $row2.append('<option value="">Select</option>')
                    if(tempAddStockBinStorageCount[pallot2]<=0){
                        $("#"+temp+" option[value='"+pallot2+"']").remove();
                    }
                    else{
                        for(let i=1;i<=parseInt(tempAddStockBinStorageCount[pallot2]);i++){
                            $row2.append('<option value="'+i+'">'+i+'</option>');
                        }
                    }
                }
            }
        }
    }
    else{}
}

equipmentItemWithSerialNo=[]
equipmentItemWithSerialNoTemp=[]
function addEquipmentItemWithSerialNo(){
    equipmentStorage=localStorage.getItem("equipmentStorage");
    id=localStorage.getItem("modalId");
    id=id.replace("equipmentFile","")
    level=localStorage.getItem("level");
    // qty=document.getElementById("qtyEquipment"+id).value;
    // type=document.getElementById("type"+id).value;
    type=localStorage.getItem("equipPlottingType");
    tempStatus=false;
    tempStorage=[]
    if(type=="individual"){
        for(let i=0;i<uniqueEquipmentSerialNos.length;i++){
            serialNo=uniqueEquipmentSerialNos[i]
            loc=document.getElementById('equipmentItemLoc'+id+'item'+i).value;
            if(loc){
                document.getElementById('equipmentItemLoc'+id+'item'+i).style.borderColor="lightgrey";
                if(level=="bins"){
                    pallot=document.getElementById('equipmentItemPallot'+id+'item'+i).value;
                    if(pallot){
                        document.getElementById('equipmentItemPallot'+id+'item'+i).style.borderColor="lightgrey";
                        bins=document.getElementById('equipmentItemNoOfBin'+id+'item'+i).value;
                        if(bins){
                            document.getElementById('equipmentItemNoOfBin'+id+'item'+i).style.borderColor="lightgrey";
                            
                            temp={"serailNo":serialNo,"loc":loc,"pallot":pallot,"bin":bins,"type":"individual"}
                            tempStorage.push(temp)
                        }
                        else{
                            document.getElementById('equipmentItemNoOfBin'+id+'item'+i).style.border="1px solid";
                            document.getElementById('equipmentItemNoOfBin'+id+'item'+i).style.borderColor="red";
                            tempStatus=true;
                        }                        
                    }
                    else{
                        document.getElementById('equipmentItemPallot'+id+'item'+i).style.border="1px solid";
                        document.getElementById('equipmentItemPallot'+id+'item'+i).style.borderColor="red";
                        tempStatus=true;
                    }    
                }
                else if(level=="pallots"){
                    pallot=document.getElementById('equipmentItemPallot'+id+'item'+i).value;
                    if(pallot){
                        document.getElementById('equipmentItemPallot'+id+'item'+i).style.borderColor="lightgrey";
                        temp={"serailNo":serialNo,"loc":loc,"pallot":pallot,"type":"individual"}
                        tempStorage.push(temp)
                    }
                    else{
                        document.getElementById('equipmentItemPallot'+id+'item'+i).style.border="1px solid";
                        document.getElementById('equipmentItemPallot'+id+'item'+i).style.borderColor="red";
                        tempStatus=true;
                    }
                }
                else{
                    temp={"serailNo":serialNo,"loc":loc,"type":"individual"}
                    tempStorage.push(temp)
                }  
            }
            else{
                document.getElementById('equipmentItemLoc'+id+'item'+i).style.border="1px solid";
                document.getElementById('equipmentItemLoc'+id+'item'+i).style.borderColor="red";
                tempStatus=true;
            }
        }
    }
    else if(type=="batchwise"){
        qty=uniqueEquipmentSerialNos.length;
        loc=document.getElementById('equipmentItemLoc'+id+'item'+'all').value;
        if(loc){
            document.getElementById('equipmentItemLoc'+id+'item'+'all').style.borderColor="lightgrey";
            if(level=="pallots" || level=="bins"){
                pallot=document.getElementById('equipmentItemPallot'+id+'item'+'all').value;
                if(pallot){
                    document.getElementById('equipmentItemPallot'+id+'item'+'all').style.borderColor="lightgrey";
                    if(level=="bins"){
                        bins=document.getElementById('equipmentItemNoOfBin'+id+'item'+'all').value;
                        if(bins){
                            document.getElementById('equipmentItemNoOfBin'+id+'item'+'all').style.borderColor="lightgrey";
                            temp={"serialNo":uniqueEquipmentSerialNos,"loc":loc,"pallot":pallot,"bins":bins,"type":"batchwise"};
                            tempStorage.push(temp);
                        }
                        else{
                            tempStatus=true;
                            document.getElementById('equipmentItemNoOfBin'+id+'item'+'all').style.border="1px solid";
                            document.getElementById('equipmentItemNoOfBin'+id+'item'+'all').style.borderColor="red";
                        }
                    }
                    else{
                        temp={"serialNo":uniqueEquipmentSerialNos,"loc":loc,"pallot":pallot,"type":"batchwise"};
                        tempStorage.push(temp);
                    }
                }
                else{
                    tempStatus=true;
                    document.getElementById('equipmentItemPallot'+id+'item'+'all').style.border="1px solid";
                    document.getElementById('equipmentItemPallot'+id+'item'+'all').style.borderColor="red";
                }
            }
            else{
                temp={"serialNo":uniqueEquipmentSerialNos,"loc":loc,"type":"batchwise"};
                tempStorage.push(temp);
            }
        }
        else{
            tempStatus=true;
            document.getElementById('equipmentItemLoc'+id+'item'+'all').style.border="1px solid";
            document.getElementById('equipmentItemLoc'+id+'item'+'all').style.borderColor="red";
        }
    }
    if(tempStatus){}
    else{
        temp1v=localStorage.getItem("runningItem");
        $.each(JSON.parse(temp1v),function(i,item){
            existingEquipSerailNo.push(item);
        });
        $.each(tempStorage,function(i,item){equipmentItemWithSerialNoTemp.push(item)});
        equipmentItemWithSerialNo.push(tempStorage);
        document.getElementById("addItemLoc").style.display="none";
        document.getElementById("addItemLoc").style.opacity="0";
        document.getElementById("form").style.filter="blur(0px)";
        document.getElementById(localStorage.getItem("modalId")).style.display="none";
        document.getElementById("modalContent").innerHTML="";
        document.getElementById("removeItem"+id).style.display="none";
        uimPallotNos.length=0;
        uimSerialNos.length=0;
        selectedUIMLocs.length=0;
        uniquePallots.length=0;
        uniquePallotsIds.length=0;
        locations.length=0;
        pallots.length=0;
        equipments.length=0;
        equipmentsLocations.length=0;
        equipmentsPallots.length=0;
        equipmentsBins.length=0;
        equipmentSerialNos.length=0;
        console.log(equipmentItemWithSerialNo);
    }
}
function validatorInput(id){
    temp=document.getElementById(id).value;
    if(temp){
        document.getElementById(id).style.borderColor="lightgrey";
        return true;
    }
    else{
        document.getElementById(id).style.border="1px solid";
        document.getElementById(id).style.borderColor="red";
        return false
    }
}
function submitStockInForm(){
    console.log(equipmentItemWithSerialNo);
    console.log(uimItemWithSerialNo);
    tempStatus=false;
    ids=["shipmentNumber","truckNumber","receivingDate","warehouse","businessTypes","noOfEquipment","noOfPallot"]
    data={}
    $.each(ids,function(i,item){
        temp=validatorInput(item);
        if(temp){
            data[item]=document.getElementById(item).value;
        }
        else{tempStatus=true;}
    })
    if(data["noOfPallot"]==0){}
    else{
        console.log(selectedUIM.length,data["noOfPallot"])
        if(selectedUIM.length==parseInt(data["noOfPallot"])){
            document.getElementById("noOfPallotDiv").style.background="#c1c1c1";
            for(let i=0;i<parseInt(document.getElementById('noOfPallot').value);i++){
                console.log(selectedUIM[i]);
                temp="uimFile"+String(selectedUIM[i]);
                tempStatus10=false;
                try{
                var files = $('#'+temp)[0].files;}
                catch(e){tempStatus10=true}
                if(tempStatus10){}
                else{
                    if(files.length > 0 ){
                        document.getElementById(temp).style.borderColor="lightgrey";
                    }
                    else{
                        tempStatus=true;
                        document.getElementById(temp).style.border="1px solid";
                        document.getElementById(temp).style.borderColor="red";
                        alert("Please Fill All the Required Info!");
                    }
                }
            }
        }
        else{
            tempStatus=true;
            alert("Please Enter Correct Quantity or Add Item!")
            document.getElementById("noOfPallotDiv").style.background="#e4baba";
        }
        var files = $('#uimStockDocument')[0].files;
        if(files.length > 0){}
        else if(parseInt(document.getElementById("noOfPallot").value)<=0){}
        else{
            tempStatus=true;
            alert("Please Attach UIM Stock Document!");
        }
    }
    if(data["noOfEquipment"]==0){}
    else{
        console.log(selectedEquip.length,data["noOfEquipment"])
        if(selectedEquip.length==parseInt(data["noOfEquipment"])){
            document.getElementById("noOfEquipmentDiv").style.background="#c1c1c1";
            for(let i=0;i<parseInt(document.getElementById("noOfEquipment").value);i++){
                temp="equipmentFile"+String(selectedEquip[i]);
                console.log(selectedEquip[i]);
                tempStatus11=false;
                try{
                var files = $('#'+temp)[0].files;}
                catch(e){tempStatus11=true}
                if(tempStatus11){}
                else{
                    if(files.length > 0 ){
                        document.getElementById(temp).style.borderColor="lightgrey";
                    }
                    else{
                        tempStatus=true;
                        document.getElementById(temp).style.border="1px solid";
                        document.getElementById(temp).style.borderColor="red";
                        alert("Please Fill All the Required Info!");
                    }
                }
            }
        }
        else{
            tempStatus=true;
            alert("Please Enter Correct Quantity or Add Item!")
            document.getElementById("noOfEquipmentDiv").style.background="#e4baba";
        }
        var files = $('#equipStockDocument')[0].files;
        if(files.length > 0){}
        else if(parseInt(document.getElementById("noOfEquipment").value)<=0){}
        else{
            tempStatus=true;
            alert("Please Attach Equipment Stock Document!");
        }
    }
    console.log(tempStatus)
    if(tempStatus){}
    else{
        data["uimItemWithSerialNo"]=uimItemWithSerialNo;
        data["equipmentItemWithSerialNo"]=equipmentItemWithSerialNo;
        data["uimPartNos"]=selectedUIM;
        data["equipPartNos"]=selectedEquip;
        console.log(data);
        postData=JSON.stringify(data);
        request=url+'/api/stockIn/';
        $.ajax({
            headers: {
                'Content-Type': 'application/json'
            },
            type: 'POST',
            url: request,
            data:postData,
            success: function(data){
                console.log(document.getElementById("stockInFormDocs"));
                document.getElementById("stockInFormDocs").action=url+"/api/uploadStockinDocs/"+String(data["sgd"]);
                alert("Stock In Successfull!\nSystem Transaction Number:"+String(data["sgd"]));
                document.getElementById("stockInFormDocs").submit();
                return false;
            }
        });
    }
}
function loadAddConsignee(){
    request=url+'/api/getIndustry/';
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'GET',
        url: request,
        success: function(data){
            $row=$("#availableBusinessType");
            $.each(data["businessType"],function(i,item){
                $row.append('<option value="'+item+'">'+item+'</option>');
            });
            $row2=$("#availableIndustries");
            $.each(data["industry"],function(i,item){
                $row2.append('<option value="'+item+'">'+item+'</option>');
            });
        }
    });
}
function addConsignee(){
    tempStatus=false;
    data={}
    ids=["industryName","consigneeName","commenceAddress","commenceDate","commenceDate","contact","businessType"]
    $.each(ids,function(i,item){
        element=document.getElementById(item);
        if(element.value){
            element.borderColor="lightgrey";
            data[item]=element.value;
        }
        else{
            element.border="1px solid";
            element.borderColor="red";
            tempStatus=true;
        }
    })
    if(tempStatus){}
    else{
        postData=JSON.stringify(data);
        request=url+'/api/addConsignee/';
        $.ajax({
            headers: {
                'Content-Type': 'application/json'
            },
            type: 'POST',
            url: request,
            data:postData,
            success: function(data){
                if(data["response"]=="exist"){
                    alert("Consignee Already Exist!");
                    document.getElementById("consigneeName").style.border="1px solid";
                    document.getElementById("consigneeName").style.borderColor="red";
                    return false;
                }
                else{
                    alert("Consignee Added Successfully!");
                    window.location.href="endUser.html";
                }
            }
        });
    }
}
function consigneeHTML(count,item){
    html='<tr>'+
    '<td>'+count+'</td>'+
   ' <td>'+item.industry+'</td>'+
    '<td id="name'+item.id+'">'+item.name+'</td>'+
    '<td>'+item.address+'</td>'+
    '<td>'+item.contact+'</td>'+
    '<td><button class="consigneeAssigned" id="'+item.id+'" onclick="goToAssignedDocs(this)">Assigned</button></td>'+
    '</tr>'
    return html
}
function loadConsignees(){
    request=url+'/api/getConsignees/';
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'GET',
        url: request,
        success: function(data){
            $row=$("#consignees");
            count=1;
            $.each(data["response"],function(i,item){
                html=consigneeHTML(count,item);
                $row.append(html);
                count+=1;
            });
        }
    });
}
warehouseLevels={}
function loadStockOut(){
    request=url+'/api/getBusinessTypes/';
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'GET',
        url: request,
        success: function(data){
            $row=$("#warehouses");
            $.each(data["warehouses"],function(i,item){
                $row.append("<option value='"+item.id+"'>"+item.name+"</option>");
                warehouseLevels[item.id]=item.level;
            });
        }
    });
}
storage=[]
selectedStockOutItems={}
function stockOutWarehouse(param){
    selectedStockOutItems.length=0;
    storage.length=0;
    warehouse=document.getElementById(param.id).value;
    localStorage.setItem("level",warehouseLevels[warehouse]);
    document.getElementById("locations").innerHTML="";
    document.getElementById("consignees").innerHTML="";
    document.getElementById("selectedStock").innerHTML="";
    $("#selectedStock").append('<tr>'+
        '<th>S.No</th>'+
        '<th>Part No</th>'+
        '<th>Nomenclature</th>'+
        '<th>Quantity</th>'+
        '<th>Location</th>'+
        '<th>Remove</th>'+
      '</tr>')
    if(warehouseLevels[warehouse]=="parts"){
        document.getElementById("divisions").innerHTML="Warehouse Locations";
        request=url+'/api/getWarehouseLocations/'+warehouse;
        $.ajax({
            headers: {
                'Content-Type': 'application/json'
            },
            type: 'GET',
            url: request,
            success: function(data){
                $row=$("#locations");
                $row.append("<option value=''>Select</option>");
                $.each(data["locations"],function(i,item){
                    $row.append("<option value='"+item.id+"'>"+item.name+"</option>")
                });
                $row2=$("#consignees");
                $row2.append("<option value=''>Select</option>");
                $.each(data["consignees"],function(i,item){
                    $row2.append("<option value='"+item.id+"'>"+item.name+" | "+item.industry+"</option>")
                });
            }
        });
    }
    else if(warehouseLevels[warehouse]=="pallots" || warehouseLevels[warehouse]=="bins"){
        document.getElementById("divisions").innerHTML="Warehouse Pallots";
        request=url+'/api/getWarehousePallots/'+warehouse;
        $.ajax({
            headers: {
                'Content-Type': 'application/json'
            },
            type: 'GET',
            url: request,
            success: function(data){
                $row=$("#locations");
                $row.append("<option value=''>Select</option>")
                $.each(data["locations"],function(i,item){
                    $row.append("<option value='"+item.id+"'>"+item.name+"</option>")
                });
                $row2=$("#consignees");
                $row2.append("<option value=''>Select</option>");
                $.each(data["consignees"],function(i,item){
                    $row2.append("<option value='"+item.id+"'>"+item.name+" | "+item.industry+"</option>")
                });
            }
        });
    }
    else{}
}
function stockOutLocationHTML(item,color){
    var locations=document.getElementById("locations").value;
    try{
        if(selectedStockOutItems[locations][item.id]){
        quantity=String(parseInt(item.quantity)-parseInt(selectedStockOutItems[locations][item.id]));
        }else{quantity=String(item.quantity);}
    }
    catch(e){
        quantity=String(item.quantity);
    }
    html='<div style="padding: 10%;background:'+color+';">'+
        '<div class="stockDiv" id="pn'+item.id+'" onclick="getStockOutItemQuantity(this)">'+quantity+'</div>'+
        '<p>'+item.name+'<br>PN# '+item.partNo+'</p>'+
        '</div>'
    return html;
}
function stockOutLocation(param){
    level=localStorage.getItem("level");
    console.log(param.id);
    data={"location":document.getElementById('locations').value};
    localStorage.setItem('location',param);
    console.log(level);
    if(level=="parts"){
        request=url+'/api/getLocationStorage/';
        postData=JSON.stringify(data);
        $.ajax({
            headers: {
                'Content-Type': 'application/json'
            },
            type: 'POST',
            url: request,
            data:postData,
            success: function(data){
                document.getElementById("stock").innerHTML="";
                $row=$("#stock");
                count=0;
                storage.length=0;
                $.each(data["storage"],function(i,item){
                    if(count%2==0){color="#daddde"}
                    else{color="white"}
                    console.log(color)
                    html=stockOutLocationHTML(item,color);
                    $row.append(html);
                    count+=1
                    storage.push(item);
                });
            }
        });
    }
    else if(level=="pallots"){
        request=url+'/api/getPallotStorage/';
        postData=JSON.stringify(data);
        $.ajax({
            headers: {
                'Content-Type': 'application/json'
            },
            type: 'POST',
            url: request,
            data:postData,
            success: function(data){
                document.getElementById("stock").innerHTML="";
                $row=$("#stock");
                count=0;
                storage.length=0;
                $.each(data["storage"],function(i,item){
                    if(count%2==0){color="#daddde"}
                    else{color="white"}
                    console.log(color)
                    html=stockOutLocationHTML(item,color);
                    $row.append(html);
                    count+=1
                    storage.push(item);
                });
            }
        });
    }
    else if(level=="bins"){
        request=url+'/api/getBinStorage/';
        postData=JSON.stringify(data);
        $.ajax({
            headers: {
                'Content-Type': 'application/json'
            },
            type: 'POST',
            url: request,
            data:postData,
            success: function(data){
                document.getElementById("stock").innerHTML="";
                $row=$("#stock");
                count=0;
                storage.length=0;
                $.each(data["storage"],function(i,item){
                    if(count%2==0){color="#daddde"}
                    else{color="white"}
                    console.log(color)
                    html=stockOutLocationHTML(item,color);
                    $row.append(html);
                    count+=1
                    storage.push(item);
                });
            }
        });
    }
    else{}
}

function getStockOutItemQuantity(param){
    document.getElementById("quantityModal").style.display="block";
    document.getElementById("quantityModal").style.opacity="1";
    document.getElementById("body").style.filter="blur(3px)";
    document.getElementById("modalBody").innerHTML="";
    id=param.id;
    id=id.replace("pn","");
    $.each(storage,function(i,item){
        if(id==item.id){
            console.log(item);
            localStorage.setItem("selectedStockOutItem",item.id);
            document.getElementById("header").innerHTML=item.name;
            $("#modalBody").append("<input id='qty"+item.id+"' placeholder='Enter Quantity'>");
        }
    })
}
function stockOutQtyClose(){
    document.getElementById("quantityModal").style.display="none";
    document.getElementById("quantityModal").style.opacity="0";
    document.getElementById("body").style.filter="blur(0px)";
}
function stockOutSelectedQuantityHTML(no,partNo,name,quantity,id,location){
    locations=document.getElementById("locations");
    var options = locations.getElementsByTagName("option");
    var optionHTML = options[locations.selectedIndex].innerHTML; 
    html="<tr id='row"+id+"loc"+location+"'>"+
    "<td>"+no+'</td>'+
    '<td>'+partNo+"</td>"+
    '<td>'+name+"</td>"+
    '<td id="cartItemQty'+id+'">'+quantity+"</td>"+
    '<td id="location'+id+'">'+optionHTML+"</td>"+
    '<td><span class="fa fa-minus fa-1x removeItem" onclick="onclickRemoveCartItem(this)" id="removeItem'+id+'loc'+location+'"></span></td>'
    return html
}
stockOutQuantity=0
function stockOutSelectedQuantity(){
    var id=localStorage.getItem("selectedStockOutItem");
    var location=document.getElementById("locations").value;
    qty=document.getElementById("qty"+String(id)).value;
    if(selectedStockOutItems[location]){}
    else{selectedStockOutItems[location]={}}
    $cart=$("#selectedStock")
    var partNo="";
    var name="";
    tempStatus2=true
    $.each(storage,function(i,item){
        if(id==item.id){
            partNo=item.partNo;
            name=item.name;
            if(qty){
                if(parseInt(qty)<=0 || parseInt(qty)>parseInt(item.quantity)){
                    alert("Invalid Quantity");
                    tempStatus=true;
                }
                else{
                    if(id in selectedStockOutItems[location]){
                        tempStatus2=false
                    }else{}
                    selectedStockOutItems[location][id]=qty;
                    tempStatus=false;
                }
            }
            else{
                tempStatus=true;
            }
        }
    });
    if(tempStatus){
        document.getElementById("qty"+String(id)).style.border="1px solid";
        document.getElementById("qty"+String(id)).style.borderColor="red";
    }
    else{
        if(tempStatus2){
        document.getElementById("qty"+String(id)).style.borderColor="lightgrey";
        stockOutQuantity+=1;
        html=stockOutSelectedQuantityHTML(stockOutQuantity,partNo,name,qty,id,location);
        $cart.append(html);
        document.getElementById("quantityModal").style.display="none";
        document.getElementById("quantityModal").style.opacity="0";
        document.getElementById("body").style.filter="blur(0px)";
        temp=localStorage.getItem('location');
        stockOutLocation(temp);
        }
        else{
            document.getElementById("cartItemQty"+String(id)).innerHTML=qty;
            document.getElementById("quantityModal").style.display="none";
            document.getElementById("quantityModal").style.opacity="0";
            document.getElementById("body").style.filter="blur(0px)";
            temp=localStorage.getItem('location');
            stockOutLocation(temp);
        }
    }
}
function onclickRemoveCartItem(param){
    id=param.id;
    console.log(id);
    id=id.replace("removeItem","");
    temp=id.split("loc");
    document.getElementById("row"+id).remove();
    delete selectedStockOutItems[temp[1]][temp[0]];
    temp=localStorage.getItem('location');
    console.log(selectedStockOutItems);
    stockOutLocation(temp);
}
function stockOutSubmit(){
    data={}
    ids=["warehouses","consignees","locations","truckNumber"]
    tempStatus=false;
    $.each(ids,function(i,item){
        if(document.getElementById(item).value){
            document.getElementById(item).style.borderColor="lightgrey";
            data[item]=document.getElementById(item).value;
        }
        else{
            document.getElementById(item).style.border="1px solid";
            document.getElementById(item).style.borderColor="red";
            tempStatus=true;
        }
    });
    keys=Object.keys(selectedStockOutItems);
    const index0 = keys.indexOf('length');
    if (index0 > -1) {
        keys.splice(index0, 1);
    }
    console.log(selectedStockOutItems);
    console.log(keys);
    if(keys.length==0){
        alert("Please Add Item for Stock Out!");
        tempStatus=true;
    }
    else{
        tempStatus=true;
        $.each(keys,function(i,item){
            keys2=Object.keys(selectedStockOutItems[item]);
            index1 = keys2.indexOf('length');
            if (index1 > -1) {
                keys2.splice(index1, 1);
            }
            if(keys2.length==0){}
            else{
                tempStatus=false;
            }
        });
        if(tempStatus){
            alert("Please Add Item for Stock Out!");
        }else{}
    }
    var files = $('#stockOutDoc')[0].files;
    if(files.length > 0){}
    else{
        tempStatus=true;
        alert("Please Attach Stock Out Document!");
    }
    if(tempStatus){}
    else{
        console.log("pass");
        data["items"]=selectedStockOutItems;
        data["businessType"]=localStorage.getItem("businessType");
        request=url+'/api/stockOut/';
        postData=JSON.stringify(data);
        $.ajax({
            headers: {
                'Content-Type': 'application/json'
            },
            type: 'POST',
            url: request,
            data:postData,
            success: function(data){
                // alert("Transaction Id: "+data["sgd"]);
                alert("Transaction Success! Transactional Id: "+String(data["sgd"]));
                document.getElementById("stockOutDocForm").action=url+"/api/uploadStockOutDocs/"+String(data["sgd"]);
                document.getElementById("stockOutDocForm").submit();
                // window.location.href="warehouses.html";
            }
        });
    }
}
function goToAssignedDocsHTML(item){
    html="<tr>"+
    "<td>"+item.sgd+"</td>"+
    "<td>"+item.partNo+"</td>"+
    "<td>"+item.nomenclature+"</td>"+
    "<td>"+item.quantity+"</td>"+
    "<td>"+item.date+"</td>"+
    "<td>"+item.warehouse+"</td>"+
    "</tr>"
    return html
}
function goToAssignedDocs(param){
    console.log(param.id);
    document.getElementById("assignedEquip").style.display="block";
    document.getElementById("assignedEquip").style.opacity="1";
    document.getElementById("body").style.filter="blur(3px)";
    document.getElementById("assignedItems").innerHTML="";
    document.getElementById("header").innerHTML=document.getElementById("name"+param.id).innerHTML;
    $row=$("#assignedItems");
    $row.append("<tr>"+
    "<th>Transaction Id</th>"+
    "<th>Part No</th>"+
    "<th>Nomenclature</th>"+
    "<th>Quantity</th>"+
    "<th>Date</th>"+
    "<th>Warehouse</th>"+
    "</tr>")
    data={}
    data["consignee"]=param.id;
    request=url+'/api/assignedEquipment/';
    postData=JSON.stringify(data);
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'POST',
        url: request,
        data:postData,
        success: function(data){
            $.each(data["equipments"],function(i,item){
                html=goToAssignedDocsHTML(item);
                $row.append(html);
            });
            console.log(data);
        }
    });
}
function assignedEquipClose(){
    document.getElementById("assignedEquip").style.display="none";
    document.getElementById("assignedEquip").style.opacity="0";
    document.getElementById("body").style.filter="blur(0px)";
}
function w2wTransferLoad(){
    request=url+'/api/getBusinessTypes/';
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'GET',
        url: request,
        success: function(data){
            $row=$("#warehouses");
            $.each(data["warehouses"],function(i,item){
                $row.append("<option value='"+item.id+"'>"+item.name+"</option>");
                warehouseLevels[item.id]=item.level;
            });
        }
    });
}
function stockTransferWarehouse(param){
    selectedStockOutItems.length=0;
    storage.length=0;
    warehouse=document.getElementById(param.id).value;
    localStorage.setItem("level",warehouseLevels[warehouse]);
    document.getElementById("locations").innerHTML="";
    document.getElementById("warehousesTransfer").innerHTML="";
    document.getElementById("selectedStock").innerHTML="";
    $("#selectedStock").append('<tr>'+
        '<th>S.No</th>'+
        '<th>Part No</th>'+
        '<th>Nomenclature</th>'+
        '<th>Quantity</th>'+
        '<th>Location</th>'+
        '<th>Remove</th>'+
      '</tr>')
    if(warehouseLevels[warehouse]=="parts"){
        document.getElementById("divisions").innerHTML="Warehouse Locations";
        request=url+'/api/getWarehouses/'+warehouse;
        $.ajax({
            headers: {
                'Content-Type': 'application/json'
            },
            type: 'GET',
            url: request,
            success: function(data){
                $row=$("#locations");
                $row.append("<option value=''>Select</option>");
                $.each(data["locations"],function(i,item){
                    $row.append("<option value='"+item.id+"'>"+item.name+"</option>")
                });
                $row2=$("#warehousesTransfer");
                $row2.append("<option value=''>Select</option>");
                $.each(data["warehouses"],function(i,item){
                    $row2.append("<option value='"+item.id+"'>"+item.name+"</option>")
                });
            }
        });
    }
    else if(warehouseLevels[warehouse]=="pallots" || warehouseLevels[warehouse]=="bins"){
        document.getElementById("divisions").innerHTML="Warehouse Pallots";
        request=url+'/api/getWarehousePallotsTransfer/'+warehouse;
        $.ajax({
            headers: {
                'Content-Type': 'application/json'
            },
            type: 'GET',
            url: request,
            success: function(data){
                $row=$("#locations");
                $row.append("<option value=''>Select</option>")
                $.each(data["locations"],function(i,item){
                    $row.append("<option value='"+item.id+"'>"+item.name+"</option>")
                });
                $row2=$("#warehousesTransfer");
                $row2.append("<option value=''>Select</option>");
                $.each(data["warehouses"],function(i,item){
                    $row2.append("<option value='"+item.id+"'>"+item.name+"</option>")
                });
            }
        });
    }
    else{}
}
function w2wTransferSubmit(){
    data={}
    ids=["warehouses","warehousesTransfer","locations"]
    tempStatus=false;
    $.each(ids,function(i,item){
        if(document.getElementById(item).value){
            document.getElementById(item).style.borderColor="lightgrey";
            data[item]=document.getElementById(item).value;
        }
        else{
            document.getElementById(item).style.border="1px solid";
            document.getElementById(item).style.borderColor="red";
            tempStatus=true;
        }
    });
    keys=Object.keys(selectedStockOutItems);
    const index0 = keys.indexOf('length');
    if (index0 > -1) {
        keys.splice(index0, 1);
    }
    console.log(selectedStockOutItems);
    console.log(keys);
    if(keys.length==0){
        alert("Please Add Item for Stock Out!");
        tempStatus=true;
    }
    else{
        tempStatus=true;
        $.each(keys,function(i,item){
            keys2=Object.keys(selectedStockOutItems[item]);
            index1 = keys2.indexOf('length');
            if (index1 > -1) {
                keys2.splice(index1, 1);
            }
            if(keys2.length==0){}
            else{
                tempStatus=false;
            }
        });
        if(tempStatus){
            alert("Please Add Item for Stock Out!");
        }else{}
    }
    truckNumber=document.getElementById("truckNumber").value;
    if(truckNumber){
        document.getElementById("truckNumber").style.border="1px solid lightgrey";
    }
    else{
        tempStatus=true;
        document.getElementById("truckNumber").style.border="1px solid red";
    }
    var files = $('#stockOutDoc')[0].files;
    if(files.length > 0){}
    else{
        tempStatus=true;
        alert("Please Attach Stock Transfer Document!");
    }
    if(tempStatus){}
    else{
        console.log("pass");
        data["truckNumber"]=truckNumber;
        data["items"]=selectedStockOutItems;
        request=url+'/api/w2wTransfer/';
        postData=JSON.stringify(data);
        $.ajax({
            headers: {
                'Content-Type': 'application/json'
            },
            type: 'POST',
            url: request,
            data:postData,
            success: function(data){
                alert("Transaction Id: "+data["sgd"]);
                // window.location.href="warehouses.html";
                document.getElementById("stockOutDocForm").action=url+"/api/uploadW2wTransferDocs/"+String(data["sgd"]);
                document.getElementById("stockOutDocForm").submit();
            }
        });
    }
}
storeItemCounter=0
function storeItemTableHeadHTML(){
    var html="<tr id='tableHead'>"+
    "<th>S.No</th>"+
    "<th>date</th>"+
    // "<th>serialNumber</th>"+
   " <th>partNo</th>"+
    "<th>Nomenclature</th>"+
    "<th>Serial No</th>"+
    "</tr>"
    return html
}
function storeItemTableHTML(item,storage){
    var html="<tr>"+
    "<td>"+storeItemCounter+"</td>"+
    // "<td>"+item.serialNumber+"</td>"+
    "<td>"+item.date+"</td>"+
   " <td>"+item.partNumber+"</td>"+
    "<td>"+item.nomenclature+"</td>"+
    " <td>"+item.serialNumber+"</td>"+storage+"</tr>"
    return html
}

w2wStoreLoc={}
w2wStorePallots={}
w2wStoreBins={}
storeInItems=[]
storeInItemLoc={}
storeInItemPallot={}
storeInItemBin={}

function getTransferItems(){
    var id=document.getElementById("transactionalId").value;
    document.getElementById("storeTransferItems").innerHTML="";
    if(id){
    document.getElementById("transactionalId").style.border="0px solid lightgrey";
    data={"id":id}
    request=url+'/api/getTransferItems/';
    postData=JSON.stringify(data);
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'POST',
        url: request,
        data:postData,
        success: function(data){
            localStorage.setItem("level",data['level']);
            request=url+'/api/getAvialableStorage/'+data['warehouse']+'/'+data['level'];
            $.ajax({
                headers: {
                    'Content-Type': 'application/json'
                },
                type: 'GET',
                url: request,
                success: function(data2){
                    console.log(data2);
                   $.each(data2["locations"],function(i,item){
                        w2wStoreLoc[item.id]=item.name;
                   if(data['level']=='pallots' || data['level']=='bins'){
                        w2wStorePallots[item.id]=[]
                        $.each(data2['pallots'],function(j,item2){
                            console.log(item2);
                            if(item.id==item2.refference){
                                temp={}
                                temp[item2.id]=item2.name;
                                w2wStorePallots[item.id].push(temp);
                            }else{}
                        if(data["level"]=="bins"){
                            w2wStoreBins[item2.id]=[]
                            $.each(data2["bins"],function(k,item3){
                                if(item2.id==item3.refference){
                                    temp=item3.id;
                                    temp3={temp:item3['quantity']}
                                    w2wStoreBins[item2.id].push(temp3);
                                }else{}
                            });
                        }
                    });
                   }
                 });
            console.log(w2wStoreLoc,
                w2wStorePallots,
                w2wStoreBins);
            $table=$("#storeTransferItems");
            html=storeItemTableHeadHTML();
            $table.append(html);
            if(data["level"]=="parts"){
                $row=$("#tableHead");
                $row.append("<th>Location</th>");
                $.each(data["response"],function(i,item){
                    storeInItems.push(item);
                    storeItemCounter+=1;
                    storage="<td><select onchange='selectItemLoc(this)' id='loc"+item.serialNumber+"'><option value=''>Select</option></select></td>";
                    html=storeItemTableHTML(item,storage);
                    temp=Object.keys(w2wStoreLoc);
                    $temp2=$("#loc"+item.serialNumber);
                    $.each(temp,function(i,item2){
                        $temp2.append("<option value='"+item2+"'>"+w2wStoreLoc[item2]+"</option>");
                    })
                    $table.append(html);
                });
            }
            else if(data["level"]=="pallots"){
                $row=$("#tableHead");
                $row.append("<th>Location</th>");
                $row.append("<th>Pallot</th>")
                $.each(data["response"],function(i,item){
                    storeInItems.push(item);
                    storeItemCounter+=1;
                    storage="<td><select onchange='storeInPallot(this)' id='loc"+item.serialNumber+"'><option value=''>Select</option></select></td>"+"<td><select id='pallot"+item.serialNumber+"' onchange='selectedItemPallot(this)'><option value=''>Select</option></select></td>";
                    html=storeItemTableHTML(item,storage);
                    $table.append(html);
                    temp=Object.keys(w2wStoreLoc);
                    console.log(temp);
                    $temp2=$("#loc"+item.serialNumber);
                    $.each(temp,function(i,item2){
                        $temp2.append("<option value='"+item2+"'>"+w2wStoreLoc[item2]+"</option>");
                    })
                });
            }
            else if(data["level"]=="bins"){
                $row=$("#tableHead");
                $row.append("<th>Location</th>");
                $row.append("<th>Pallot</th>");
                $row.append("<th>Bins</th>");
                $.each(data["response"],function(i,item){
                    storeInItems.push(item);
                    storeItemCounter+=1;
                    var storage="<td><select onchange='storeInPallot(this)' id='loc"+item.serialNumber+"'><option value=''>Select</option></select></td>"+"<td><select onchange='storeInBin(this)' id='pallot"+item.serialNumber+"'><option value=''>Select</option></select></td>"+"<td><select onclick='selectedItemBins(this)' id='bin"+item.serialNumber+"'><option value=''>Select</option></select></td>";
                    html=storeItemTableHTML(item,storage);
                    $table.append(html);
                    temp=Object.keys(w2wStoreLoc);
                    $temp2=$("#loc"+item.serialNumber);
                    $.each(temp,function(i,item2){
                        $temp2.append("<option value='"+item2+"'>"+w2wStoreLoc[item2]+"</option>");
                    });
                });
            }
            else{}
            console.log(data);
        }
        });
        }
        });
    }
    else{
        document.getElementById("transactionalId").style.border="1px solid red";
    }
}
function selectItemLoc(param){
    var value=document.getElementById(param.id).value;
    id=param.id;
    id=id.replace("loc","");
    storeInItemLoc[id]=value;
}
function storeInPallot(param){
    var id=param.id;
    id=id.replace("loc","pallot");
    $pallot=$("#"+id);
    var value=document.getElementById(param.id).value;
    document.getElementById(id).innerHTML="";
    $pallot.append("<option value=''>Select</option>");
    $.each(w2wStorePallots[value],function(i,item){
        temp=Object.keys(item);
        key=temp[0];
        $pallot.append("<option value='"+key+"'>"+item[key]+"</option>");
    });
    temp=param.id;
    temp2=temp.replace("loc","");
    if(localStorage.getItem("level")=="bins"){
        storeInItemBin[temp2]=[]
        storeInItemBin[temp2]=[value];
    }
    else{
        storeInItemBin[temp2]=[];
        storeInItemPallot[temp2]=[value];
    }
}
function selectedItemPallot(param){
    var value=document.getElementById(param.id).value;
    id=param.id;
    id=id.replace("pallot","");
    temp=storeInItemPallot[id][0];
    storeInItemPallot[id]=[temp];
    storeInItemPallot[id].push(value);
}
function storeInBin(param){
    var value=document.getElementById(param.id).value;
    var id=param.id;
    id=id.replace("pallot","bin");
    $bin=$("#"+id);
    var value=document.getElementById(param.id).value;
    document.getElementById(id).innerHTML="";
    $bin.append("<option value=''>Select</option>");
    console.log(w2wStoreBins[value]);
    $.each(w2wStoreBins[value],function(i,item){
        temp=Object.keys(item);
        key=temp[0];
        for(var i=1;i<=parseInt(item[key]);i++){
            $bin.append("<option value='"+i+"'>"+i+"</option>");
        }
    });
    var value=document.getElementById(param.id).value;
    id=param.id;
    id=id.replace("pallot","");
    temp=storeInItemBin[id][0];
    storeInItemBin[id]=[temp];
    storeInItemBin[id].push(value);
}
function selectedItemBins(param){
    var value=document.getElementById(param.id).value;
    id=param.id;
    id=id.replace("bin","");
    temp=storeInItemBin[id][0];
    temp2=storeInItemBin[id][1];
    storeInItemBin[id]=[temp];
    storeInItemBin[id].push(temp2);
    storeInItemBin[id].push(value);
}
function storeTransferItem(){
    var level=localStorage.getItem("level");
    var transactionalId=document.getElementById("transactionalId").value;
    truckNumber=document.getElementById("truckNumber").value;
    if(transactionalId){
        let length=storeInItems.length;
        if(length>0){
            console.log(storeInItems);
            if(level=="parts"){
                tempStatus=false;
                $.each(storeInItems,function(i,item){
                    console.log(item);
                    var value=document.getElementById("loc"+item.serialNumber).value;
                    if(value=='' || value==" " || value=="  "){
                        tempStatus=true;
                        document.getElementById("loc"+item.serialNumber).style.border="1px solid red";
                        
                    }
                    else{
                        document.getElementById("loc"+item.serialNumber).style.border="1px solid lightgrey";
                    }
                });
                truckNumber=document.getElementById("truckNumber").value;
                if(truckNumber){
                    document.getElementById("truckNumber").style.border="1px solid lightgrey";
                }
                else{
                    tempStatus=true;
                    document.getElementById("truckNumber").style.border="1px solid red";
                }
                var files = $('#stockInDoc')[0].files;
                if(files.length > 0){}
                else{
                    tempStatus=true;
                    alert("Please Attach Stock In Document!");
                }
                if(tempStatus){}
                else{
                    request=url+'/api/w2wTransferStockIn';

                    data={"locations":storeInItemLoc,"level":level,"ti":transactionalId,"truckNumber":truckNumber}
                    postData=JSON.stringify(data);
                    console.log(postData);
                    $.ajax({
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        type: 'POST',
                        url: request,
                        data:postData,
                        success: function(data){
                            console.log(data);
                            alert("Transaction Success! Transactional Id: "+String(data["sgd"]));
                            document.getElementById("stockInDocForm").action=url+"/api/uploadW2wStoreDocs/"+String(data["sgd"]);
                            document.getElementById("stockInDocForm").submit();
                            // window.location.href="w2wTransferSelection.html";
                        }
                    });
                }
                console.log(storeInItemLoc);
            }
            else if(level=="pallots"){
                tempStatus=false;
                $.each(storeInItems,function(i,item){
                    console.log(item);
                    var value=document.getElementById("loc"+item.serialNumber).value;
                    if(value=='' || value==" " || value=="  "){
                        tempStatus=true;
                        document.getElementById("loc"+item.serialNumber).style.border="1px solid red";
                    }
                    else{
                        document.getElementById("loc"+item.serialNumber).style.border="1px solid lightgrey";
                    }
                    var value2=document.getElementById("pallot"+item.serialNumber).value;
                    if(value2=='' || value2==" " || value2=="  "){
                        tempStatus=true;
                        document.getElementById("pallot"+item.serialNumber).style.border="1px solid red";
                    }
                    else{
                        document.getElementById("pallot"+item.serialNumber).style.border="1px solid lightgrey";
                    }
                });
                var files = $('#stockInDoc')[0].files;
                if(files.length > 0){}
                else{
                    tempStatus=true;
                    alert("Please Attach Stock In Document!");
                }
                if(tempStatus){}
                else{
                    request=url+'/api/w2wTransferStockIn';
                    data={"locations":storeInItemPallot,"level":level,"ti":transactionalId}
                    postData=JSON.stringify(data);
                    console.log(postData);
                    $.ajax({
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        type: 'POST',
                        url: request,
                        data:postData,
                        success: function(data){
                            console.log(data);
                            alert("Transaction Success!");
                            window.location.href="w2wTransferSelection.html"
                        }
                    });
                }
                console.log(storeInItemPallot);
            }
            else if(level=="bins"){
                tempStatus=false;
                $.each(storeInItems,function(i,item){
                    console.log(item);
                    var value=document.getElementById("loc"+item.serialNumber).value;
                    console.log(value);
                    if(value=='' || value==" " || value=="  "){
                        tempStatus=true;
                        document.getElementById("loc"+item.serialNumber).style.border="1px solid red";
                    }
                    else{
                        document.getElementById("loc"+item.serialNumber).style.border="1px solid lightgrey";
                    }
                    var value2=document.getElementById("pallot"+item.serialNumber).value;
                    console.log(value2);
                    if(value2=='' || value2==" " || value2=="  "){
                        tempStatus=true;
                        document.getElementById("pallot"+item.serialNumber).style.border="1px solid red";
                    }
                    else{
                        document.getElementById("pallot"+item.serialNumber).style.border="1px solid lightgrey";
                    }
                    var value3=document.getElementById("bin"+item.serialNumber).value;
                    console.log(value3);
                    if(value3=='' || value3==" " || value3=="  "){
                        tempStatus=true;
                        document.getElementById("bin"+item.serialNumber).style.border="1px solid red";
                    }
                    else{
                        document.getElementById("bin"+item.serialNumber).style.border="1px solid lightgrey";
                    }
                });
                var files = $('#stockInDoc')[0].files;
                if(files.length > 0){}
                else{
                    tempStatus=true;
                    alert("Please Attach Stock In Document!");
                }
                if(tempStatus){}
                else{
                    request=url+'/api/w2wTransferStockIn';
                    data={"locations":storeInItemBin,"level":level,"ti":transactionalId}
                    postData=JSON.stringify(data);
                    console.log(postData);
                    console.log(storeInItemBin);
                    $.ajax({
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        type: 'POST',
                        url: request,
                        data:postData,
                        success: function(data){
                            console.log(data);
                            alert("Transaction Success!");
                            window.location.href="w2wTransferSelection.html"
                        }
                    });
                }
                console.log(storeInItemBin);
            }
            else{}
        }
        else{
            alert("Invalid Items!");
        }
    }
    else{
        document.getElementById("transactionalId").style.border="1px solid red";
    }
    // window.location.replace("dashboard.html");
}
returnWarehouse={}
function onloadReturnStock(){
    $warehouses=$("#warehouses");
    request=url+'/api/getReturnWarehouses';
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'GET',
        url: request,
        success: function(data){
            $.each(data["response"],function(i,item){
                temp="<option value='"+item.id+"'>"+item.name+"</option>"
                returnWarehouse[item.id]=item.level;
                $warehouses.append(temp);
            })
            console.log(data);
            console.log($warehouses);
        }
    });
}
function returnItemTableHTML(item,storage){
    var html="<tr>"+
    "<td>"+storeItemCounter+"</td>"+
    "<td><input type='checkbox' id='return"+item.serialNo+"'></td>"+
    "<td>"+item.serialNo+"</td>"+
    "<td>"+item.date+"</td>"+
   " <td>"+item.partNumber+"</td>"+
    "<td>"+item.nomenclature+"</td>"+storage+"</tr>"
    return html
}
function returnItemTableHeadHTML(){
    var html="<tr id='tableHead'>"+
    "<th>S.No</th>"+
    "<th>Select</th>"+
    "<th>Serial No</th>"+
    "<th>date</th>"+
    // "<th>serialNumber</th>"+
   " <th>partNo</th>"+
    "<th>Nomenclature</th>"+
    "</tr>"
    return html
}
transactionSerialNos=[]
function getConsigneeAssignedItems(){
    warehouse=document.getElementById("warehouses").value;
    if(warehouse){
    document.getElementById("warehouses").style.border="1px solid lightgrey"
    document.getElementById("warehouses").setAttribute('disabled', '');
    var id=document.getElementById("transactionalId").value;
    document.getElementById("storeTransferItems").innerHTML="";
    if(id){
    document.getElementById("transactionalId").style.border="0px solid lightgrey";
    data={"id":id}
    request=url+'/api/getStockReturnItems/';
    postData=JSON.stringify(data);
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'POST',
        url: request,
        data:postData,
        success: function(data){
            console.log(returnWarehouse);
            level=returnWarehouse[warehouse];
            localStorage.setItem("level",data['level']);
            console.log(warehouse,level);
            request=url+'/api/getAvialableStorage/'+warehouse+'/'+level;
            $.ajax({
                headers: {
                    'Content-Type': 'application/json'
                },
                type: 'GET',
                url: request,
                success: function(data2){
                    console.log(data2);
                   $.each(data2["locations"],function(i,item){
                        w2wStoreLoc[item.id]=item.name;
                   if(data['level']=='pallots' || data['level']=='bins'){
                        w2wStorePallots[item.id]=[]
                        $.each(data2['pallots'],function(j,item2){
                            console.log(item2);
                            if(item.id==item2.refference){
                                temp={}
                                temp[item2.id]=item2.name;
                                w2wStorePallots[item.id].push(temp);
                            }else{}
                        if(data["level"]=="bins"){
                            w2wStoreBins[item2.id]=[]
                            $.each(data2["bins"],function(k,item3){
                                if(item2.id==item3.refference){
                                    temp=item3.id;
                                    temp3={temp:item3['quantity']}
                                    w2wStoreBins[item2.id].push(temp3);
                                }else{}
                            });
                        }
                    });
                   }
                 });
            console.log(w2wStoreLoc,
                w2wStorePallots,
                w2wStoreBins);
            $table=$("#storeTransferItems");
            html=returnItemTableHeadHTML();
            $table.append(html);
            if(data["level"]=="parts"){
                $row=$("#tableHead");
                $row.append("<th>Location</th>");
                $.each(data["response"],function(i,item){
                    transactionSerialNos.push(item.serialNo);
                    storeInItems.push(item);
                    storeItemCounter+=1;
                    storage="<td><select onchange='selectItemLoc(this)' id='loc"+item.serialNo+"'><option value='none'>Select</option></select></td>";
                    html=returnItemTableHTML(item,storage);
                    temp=Object.keys(w2wStoreLoc);
                    $temp2=$("#loc"+item.serialNo);
                    $.each(temp,function(i,item2){
                        $temp2.append("<option value='"+item2+"'>"+w2wStoreLoc[item2]+"</option>");
                    })
                    $table.append(html);
                });
            }
            else if(data["level"]=="pallots"){
                $row=$("#tableHead");
                $row.append("<th>Location</th>");
                $row.append("<th>Pallot</th>")
                $.each(data["response"],function(i,item){
                    transactionSerialNos.push(item.serialNo);
                    storeInItems.push(item);
                    storeItemCounter+=1;
                    storage="<td><select onchange='storeInPallot(this)' id='loc"+item.serialNo+"'><option value='none'>Select</option></select></td>"+"<td><select id='pallot"+item.serialNo+"' onchange='selectedItemPallot(this)'><option value='none'>Select</option></select></td>";
                    html=returnItemTableHTML(item,storage);
                    $table.append(html);
                    temp=Object.keys(w2wStoreLoc);
                    console.log(temp);
                    $temp2=$("#loc"+item.serialNo);
                    $.each(temp,function(i,item2){
                        $temp2.append("<option value='"+item2+"'>"+w2wStoreLoc[item2]+"</option>");
                    })
                });
            }
            else if(data["level"]=="bins"){
                $row=$("#tableHead");
                $row.append("<th>Location</th>");
                $row.append("<th>Pallot</th>");
                $row.append("<th>Bins</th>");
                $.each(data["response"],function(i,item){
                    transactionSerialNos.push(item.serialNo);
                    storeInItems.push(item);
                    storeItemCounter+=1;
                    var storage="<td><select onchange='storeInPallot(this)' id='loc"+item.serialNo+"'><option value='none'>Select</option></select></td>"+"<td><select onchange='storeInBin(this)' id='pallot"+item.serialNo+"'><option value='none'>Select</option></select></td>"+"<td><select onclick='selectedItemBins(this)' id='bin"+item.serialNo+"'><option value='none'>Select</option></select></td>";
                    html=returnItemTableHTML(item,storage);
                    $table.append(html);
                    temp=Object.keys(w2wStoreLoc);
                    $temp2=$("#loc"+item.serialNo);
                    $.each(temp,function(i,item2){
                        $temp2.append("<option value='"+item2+"'>"+w2wStoreLoc[item2]+"</option>");
                    });
                });
            }
            else{}
            console.log(data);
        }
        });
        }
        });
    }
    else{
        document.getElementById("transactionalId").style.border="1px solid red";
    }
    }
    else{
        document.getElementById("warehouses").style.border="1px solid red";
    }
}

function storeReturedItem(){
    selectedReturnedItems=[]
    warehouse=document.getElementById("warehouses").value;
    level=returnWarehouse[warehouse];
    locations=[];
    pallots=[];
    bins=[];
    console.log(level);
    $.each(transactionSerialNos,function(i,item){
        console.log(i);
        checkbox=document.getElementById("return"+item);
        if (checkbox.checked == true){
            serialNo=item.replace("return","");
            if(selectedReturnedItems.includes(serialNo)){}
            else{selectedReturnedItems.push(serialNo);}
        }else{}
    });
    tempStatus=false;
    $.each(selectedReturnedItems,function(i,item){
        console.log(item);
        if(level=="parts"){
            loc=document.getElementById("loc"+item).value;
            console.log(loc);
            if(loc=="none"){
                tempStatus=true;
                document.getElementById("loc"+item).style.border="1px solid red";
            }
            else{
                locations.push(loc);
                document.getElementById("loc"+item).style.border="1px solid lightgrey";
            }
        }
        else if(level=="pallots"){
            loc=document.getElementById("loc"+item).value;
            pallot=document.getElementById("pallot"+item).value;
            if(loc=="none"){
                tempStatus=true;
                document.getElementById("loc"+item).style.border="1px solid red";
            }
            else{
                locations.push(loc);
                document.getElementById("loc"+item).style.border="1px solid lightgrey";
            }
            if(pallot=="none"){
                tempStatus=true;
                document.getElementById("pallot"+item).style.border="1px solid red";
            }
            else{
                pallots.push(pallot);
                document.getElementById("pallot"+item).style.border="1px solid lightgrey";
            }
        }
        else if(level=="bins"){
            loc=document.getElementById("loc"+item).value;
            pallot=document.getElementById("pallot"+item).value;
            bin=document.getElementById("bin"+item).value;
            console.log(loc);
            if(loc=="none"){
                tempStatus=true;
                document.getElementById("loc"+item).style.border="1px solid red";
            }
            else{
                locations.push(loc);
                document.getElementById("loc"+item).style.border="1px solid lightgrey";
            }
            if(pallot=="none"){
                tempStatus=true;
                document.getElementById("pallot"+item).style.border="1px solid red";
            }
            else{
                pallots.push(pallot);
                document.getElementById("pallot"+item).style.border="1px solid lightgrey";
            }
            if(bin=="none"){
                tempStatus=true;
                document.getElementById("bin"+item).style.border="1px solid red";
            }
            else{
                bins.push(bin);
                document.getElementById("bin"+item).style.border="1px solid lightgrey";
            }
        }
        else{
            tempStatus=true;
            document.getElementById("warehouses").style.border="1px solid red";
        }
    });
    truckNumber=document.getElementById("truckNumber").value;
    if(truckNumber){
        document.getElementById("truckNumber").style.border="1px solid lightgrey";
    }
    else{
        tempStatus=true;
        document.getElementById("truckNumber").style.border="1px solid red";
    }
    var files = $('#stockInDoc')[0].files;
    if(files.length > 0){}
    else{
        tempStatus=true;
        alert("Please Attach Stock Return Document!");
    }
    if(tempStatus){selectedReturnedItems.length=0;}
    else{
        if(level=="parts"){
            var id=document.getElementById("transactionalId").value;
            data={"locations":locations,"warehouse":warehouse,"level":level,"serialNo":selectedReturnedItems,"tid":id,"truckNumber":truckNumber}
            data["businessType"]=localStorage.getItem("businessType");
            postData=JSON.stringify(data);
            request=url+'/api/storeStockReturn';
            $.ajax({
                headers: {
                    'Content-Type': 'application/json'
                },
                type: 'POST',
                url: request,
                data:postData,
                success: function(data){
                    console.log(data);
                    if(data["response"]=="success"){
                        alert("Transaction Success! Transactional Id: "+String(data["sgd"]));
                        document.getElementById("stockInDocForm").action=url+"/api/uploadReturnDocs/"+String(data["sgd"]);
                        document.getElementById("stockInDocForm").submit();
                        // window.location.href="warehouses.html"
                    }else{}
                }
            });
        }
        else if(level=="pallot"){
            var id=document.getElementById("transactionalId").value;
            data={"locations":locations,"pallots":pallots,"warehouse":warehouse,"level":level,"serialNo":selectedReturnedItems,"tid":id,"truckNumber":truckNumber}
            data["businessType"]=localStorage.getItem("businessType");
            postData=JSON.stringify(data);
            request=url+'/api/storeStockReturn';
            $.ajax({
                headers: {
                    'Content-Type': 'application/json'
                },
                type: 'POST',
                url: request,
                data:postData,
                success: function(data){
                    console.log(data);
                    if(data["response"]=="success"){
                        alert("Transaction Success! Transactional Id: "+String(data["sgd"]));
                        document.getElementById("stockInDocForm").action=url+"/api/uploadReturnDocs/"+String(data["sgd"]);
                        document.getElementById("stockInDocForm").submit();
                        // window.location.href="warehouses.html"
                    }else{}
                }
            });
        }
        else if(level=="bins"){
            var id=document.getElementById("transactionalId").value;
            data={"locations":locations,"pallots":pallots,"bins":bins,"warehouse":warehouse,"level":level,"serialNo":selectedReturnedItems,"tid":id,"truckNumber":truckNumber}
            data["businessType"]=localStorage.getItem("businessType");
            postData=JSON.stringify(data);
            request=url+'/api/storeStockReturn';
            $.ajax({
                headers: {
                    'Content-Type': 'application/json'
                },
                type: 'POST',
                url: request,
                data:postData,
                success: function(data){
                    console.log(data);
                    if(data["response"]=="success"){
                        alert("Transaction Success! Transactional Id: "+String(data["sgd"]));
                        document.getElementById("stockInDocForm").action=url+"/api/uploadReturnDocs/"+String(data["sgd"]);
                        document.getElementById("stockInDocForm").submit();
                        // window.location.href="warehouses.html"
                    }else{}
                }
            });
        }
        else{}
        console.log(selectedReturnedItems);
        selectedReturnedItems.length=0;
    }
}

function login(){
    // console.log("access")
    email=document.getElementById("email").value;
    password=document.getElementById("password").value;
    if(email==""){
        document.getElementById("email").style.borderColor="red";
    }
    else if(password==""){
        document.getElementById("password").style.borderColor="red";
    }
    else{
        document.getElementById("email").style.borderColor="grey";
        document.getElementById("password").style.borderColor="grey";
        data={"email":email,"password":password};
        postData=JSON.stringify(data);
        request=url+'/api/login/';
        $.ajax({
            headers: {
                'Content-Type': 'application/json'
            },
            type: 'POST',
            url: request,
            // url : 'http://127.0.0.1:8081/api/allusers/'+'20',
            data:postData,
            success: function(data){
                if(data["response"]=="success"){
                    document.getElementById("error").style.display="none";
                    document.getElementById("error").innerHTML="";
                    localStorage.setItem("email",email);
                    localStorage.setItem("businessType",data["businessType"]);
                    console.log(data);
                    window.location.href="dashboard.html";
                }
                else{
                    document.getElementById("error").style.display="block"
                    document.getElementById("error").innerHTML=data["response"]
                }
            }
        });
    }
}