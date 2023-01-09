from flask import Flask,jsonify,request,redirect
import mysql.connector as mysql
from cryptography.fernet import Fernet
from flask_cors import CORS
import json
from datetime import datetime
import random
import os
from werkzeug.utils import secure_filename
import pandas as pd
import numpy as np
from datetime import date as dateLib
from sendEmail import sendMail

app=Flask(__name__)
db_name = "wms"
db_password = "Sohaib023612"
db_user = "root"
db_host = "127.0.0.1"
key=b'i3vVJAiA2-e6JIBoTBwvmQNmTXvVhbr60p5jOYVRVws='

CORS(app)

def database():
    db = mysql.connect(host=db_host, user=db_user, passwd=db_password, database=db_name)
    cursor=db.cursor(buffered=True)
    return db,cursor

def getLastTransactionId(tableName):
    db,cursor=database()
    query="select id from "+tableName+" order by id desc limit 1"
    cursor.execute(query)
    result=cursor.fetchone()
    return result[0]

def sendStockInEmail(businessType,warehouse,sgd):
    db,cursor=database()
    query="select email from emails where businessType=%s"
    cursor.execute(query,(businessType,))
    result=cursor.fetchall()
    text="Stock In task performed in the "+warehouse+" warehouse. Transactional Id: "+sgd
    if result:
        for row in result:
            sendMail(text,row[0])
    return "success"

def sendStockOutEmail(businessType,warehouse,sgd):
    db,cursor=database()
    query="select email from emails where businessType=%s"
    cursor.execute(query,(businessType,))
    result=cursor.fetchall()
    text="Stock Out task performed in the "+warehouse+" warehouse. Transactional Id:"+sgd
    if result:
        for row in result:
            sendMail(text,row[0])
    return "success"

def sendStockReturnEmail(businessType,warehouse,sgd):
    db,cursor=database()
    query="select email from emails where businessType=%s"
    cursor.execute(query,(businessType,))
    result=cursor.fetchall()
    text="Returned Item stored in the "+warehouse+" warehouse. Transactional Id:"+sgd
    print(result)
    if result:
        for row in result:
            sendMail(text,row[0])
    return "success"

@app.route("/api/existingUIMSerialNos/",methods=["GET","POST"])
def existingUIMSerialNos():
    db,cursor=database()
    pallots=[]
    serialNo=[]
    query="select distinct pallotNo from UIMStockInItems"
    cursor.execute(query)
    result=cursor.fetchall()
    if result:
        for row in result:
            pallots.append(row[0])
    query2="select serialNo from UIMStockInItems"
    cursor.execute(query2)
    result2=cursor.fetchall()
    if result2:
        for row2 in result:
            serialNo.append(row2[0])
    return jsonify({"pallots":pallots,"serialNos":serialNo})

@app.route("/api/existingEquipSerialNos/",methods=["GET","POST"])
def existingEquipSerialNos():
    db,cursor=database()
    serialNo=[]
    query2="select serialNo from EquipStockInItems"
    cursor.execute(query2)
    result2=cursor.fetchall()
    if result2:
        for row2 in result2:
            serialNo.append(row2[0])
    return jsonify({"serialNos":serialNo})

@app.route("/api/getDashboardData",methods=["GET","POST"])
def getDashboardData():
    db,cursor=database()
    query="select count(distinct(businessType)) from bom;"
    cursor.execute(query)
    result=cursor.fetchone()
    query2="select count(id) from warehouses;"
    cursor.execute(query2)
    result2=cursor.fetchone()
    query3="select count(id) from locations;"
    cursor.execute(query3)
    result3=cursor.fetchone()
    query4="select count(id) from pallots;"
    cursor.execute(query4)
    result4=cursor.fetchone()
    query5="select count(id) from locations;"
    cursor.execute(query5)
    result5=cursor.fetchone()
    query6="select count(id) from bins;"
    cursor.execute(query6)
    result6=cursor.fetchone()
    return jsonify({"totalBusniess":result[0],"totalWarehouses":result2[0],"totalLocations":result3[0],"totalPallots":result4[0],"totalLocations":result5[0],"totalBins":result6[0]})

@app.route("/api/wms/addWarehouse",methods=["GET","POST"])
def addWarehouse():
    db,cursor=database()
    data=request.get_data()
    data = json.loads(data)
    print(data)
    query="select id from warehouses where name=%s"
    cursor.execute(query,(data["name"],))
    result=cursor.fetchone()
    print(result)
    if result:return jsonify({"response":"exist"})
    else:
        currentDay = datetime.now().day
        currentMonth = datetime.now().month
        currentYear = datetime.now().year
        currentHour = datetime.now().hour
        currentMinute = datetime.now().minute
        currentSecond = datetime.now().second
        temp=[str(ord(x)) for x in data["name"]]
        end="".join(temp)
        code=str(currentDay)+str(currentMonth)+str(currentYear)+str(currentHour)+str(currentMinute)+str(currentSecond)+end
        query="insert into warehouses(sgd, name, address, commence, level) values(%s,%s,%s,%s,%s)"
        cursor.execute(query,(code,data["name"],data["address"],data["date"],data["level"]))
        db.commit()
        whId=getLastTransactionId('warehouses')
        for i in range(int(data["noOfParts"])):
            code2=str(currentDay)+str(currentMonth)+str(currentYear)+str(currentHour)+str(currentMinute)+str(currentSecond)+str(whId)
            if data["level"]=="bins" or data["level"]=="pallots":pallotQty=data["noOfPallots"+str(i)]
            else:pallotQty=0
            query2="insert into locations(sgd, name, uom, pallotQuantity, refference, refferenceId, size) values(%s,%s,%s,%s,%s,%s,%s)"
            cursor.execute(query2,(code2,data["noOfParts"+str(i)],data["uom"],pallotQty,'warehouse',str(whId),data["locSize"+str(i)]))
            db.commit()
            if data["level"]=="pallots" or data["level"]=="bins":
                locId=getLastTransactionId('locations')
                pallotSize=float(data["locSize"+str(i)])/int(pallotQty)
                for j in range(int(pallotQty)):
                    if data["level"]=="bins":binQty=9 #data["pn"+str(i)+"noOfBins"+str(j)]
                    else:binQty=0
                    temp=[str(ord(x)) for x in 'pallot']
                    end3="".join(temp)
                    code3=str(currentDay)+str(currentMonth)+str(currentYear)+str(currentHour)+str(currentMinute)+str(currentSecond)+str(whId)
                    query3="insert into pallots(sgd, name, uom, binQuantity, refference, refferenceId, size, warehouseId) values(%s, %s, %s, %s, %s, %s, %s, %s)"
                    cursor.execute(query3,(code3,data["p"+str(i)+"pn"+str(j)],data["uom"],binQty,'location',locId,pallotSize,str(whId)))
                    db.commit()
                    if data["level"]=="bins":
                        pallotId=getLastTransactionId('pallots')
                        pallotSize=float(data["locSize"+str(i)])/int(pallotQty)
                        for k in range(int(binQty)):
                            code4=str(whId)+str(data["p"+str(i)+"pn"+str(j)])+str(k)
                            query4="insert into bins(sgd, refference, refferenceId, warehouseId) values(%s, %s, %s, %s)"
                            cursor.execute(query4,(code4,'pallots',pallotId,str(whId)))
                            db.commit()
        return jsonify({"response":"success"})

@app.route("/api/getAllWarehouses/",methods=["GET","POST"])
def getAllWarehouses():
    db,cursor=database()
    query="select * from warehouses"
    query2="select * from locations"
    query3="select * from pallots"
    query4="select * from bins"
    cursor.execute(query)
    result1=cursor.fetchall()
    cursor.execute(query2)
    result2=cursor.fetchall()
    cursor.execute(query3)
    result3=cursor.fetchall()
    cursor.execute(query4)
    result4=cursor.fetchall()
    warehouses=[]
    if result1:
        for row in result1:
            temp={"id":row[0], "sgd":row[1], "name":row[2], "address":row[3], "commence":row[4], "level":row[5]}
            warehouses.append(temp)
    locations=[]
    if result2:
        for row in result2:
            temp={"id":row[0], "sgd":row[1], "name":row[2], "uom":row[3], "pallotQuantity":row[4], "refference":row[5], "refferenceId":row[6], "size":row[7],"status":row[8]}
            locations.append(temp)
    pallots=[]
    if result3:
        for row in result3:
            temp={"id":row[0], "sgd":row[1], "name":row[2], "uom":row[3], "binQuantity":row[4], "refference":row[5], "refferenceId":row[6], "size":row[7], "warehouseId":row[8], "status":row[9]}
            pallots.append(temp)
    bins=[]
    if result3:
        for row in result4:
            temp={"id":row[0], "sgd":row[1], "refference":row[2], "refferenceId":row[3], "warehouseId":row[4], "status":row[5]}
            bins.append(temp)
    return jsonify({"warehouses":warehouses,"locations":locations,"pallots":pallots,"bins":bins})

@app.route("/api/wms/addLocation/",methods=["GET","POST"])
def addLocations():
    db,cursor=database()
    data=request.get_data()
    data = json.loads(data)
    temp=data["loc"].split("/")
    id=temp[1]
    currentDay = datetime.now().day
    currentMonth = datetime.now().month
    currentYear = datetime.now().year
    currentHour = datetime.now().hour
    currentMinute = datetime.now().minute
    currentSecond = datetime.now().second
    query0="select uom from locations where refferenceId=%s"
    cursor.execute(query0,(id,))
    result=cursor.fetchone()
    now=datetime.now()
    code=str(currentDay)+str(currentMonth)+str(currentYear)+str(currentHour)+str(currentMinute)+str(currentSecond)+id
    query="insert into locations(sgd, name, uom, pallotQuantity, refference, refferenceId, size) values(%s,%s,%s,%s,%s,%s,%s)"
    cursor.execute(query,(code,data["name"],result[0],0,'warehouse',id,data["size"]))
    db.commit()
    return jsonify({"response":"success"})

def validateNumData(num):
    if num=="":return num
    else:return ""

def validateStrData(data):
    if data=="":return ""
    else:return str(data)

@app.route("/api/uploadBom/",methods=["GET","POST"])
def uploadBom():
    print("Access")
    if True:
        status=True
        if "datasheet" in request.files:
            file=request.files["datasheet"]
            fileName=file.filename
            temp=fileName.split(".")
            format=temp[1]
            file.save(os.path.join("E:\docsTemp", secure_filename("data."+format)))
            # file.save(os.path.join("datasheet/", secure_filename("data."+format)))  
            data={}
            if format=="csv":
                # data=pd.read_csv("datasheet/data.csv")
                data=pd.read_csv("E:/docsTemp/data.csv")
            elif format=="xls":
                # data=pd.read_excel("datasheet/data.xls")
                data=pd.ExcelFile(r"E:/docsTemp/data.xls", sheet_name=None) 
                data=data["bom"]
            elif format=="xlsx":
                # data = pd.read_excel('datasheet/data.xlsx', sheet_name=None)
                data=pd.read_excel("E:/docsTemp/data.xlsx", sheet_name=None)
                data=data["bom"]
            else:status=False
        else:status=False
        if status:
            data=data.replace(np.nan, 0)
            db,cursor=database()
            dublicates=[]
            for i in range(len(data)):
                print(i)
                partNo=validateStrData(data["sku/partNo"][i])
                nomenclature=validateStrData(data['nomenclature/description'][i])
                nsn=validateStrData(data['nsn'][i])
                uom=validateStrData(data['uom'][i])
                currency=validateStrData(data['currency'][i])
                supplier=validateStrData(data['supplier'][i])
                medium=validateStrData(data['medium'][i])
                side=validateStrData(data['side'][i])
                types=validateStrData(data['type'][i])
                unitPrice=validateNumData(data['unitPrice'][i])
                customer=validateStrData(data['customer'][i])
                businessType=validateStrData(data['businessType'][i])
                date=datetime.now()
                date=date.strftime("%y-%m-%d")
                query0="select id from bom where partNo=%s and customer=%s"
                cursor.execute(query0,(partNo,customer))
                result=cursor.fetchone()
                if result:dublicates.append(partNo)
                else:
                    query="insert into bom(partNo, nomenclature, nsn, uom, currency, supplier, medium, side, type, unitPrice, customer, businessType, uploadDate, uploadedBy) values(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
                    values=(partNo,nomenclature, nsn, uom, currency,supplier, medium, side, types, unitPrice, customer,businessType,date,"sohaib")
                    cursor.execute(query,values)
            db.commit()
            if dublicates:response="File Uploaded Success!"
            else:response="Uploaded Successfully!"
        else:
            response="Unknown File Format!"
            dublicates=[]
    else:
        response="Unknown File Format!"
        dublicates=[]
    dublicate=" | ".join(dublicates)
    # html="<script>alert('"+response+"!\nDublicates: \n"+dublicate+"');</script>"
    html="<script>alert('"+response+" | Dubicates Part No: "+dublicate+"!');window.location.href = 'https://google.com';</script>"
    return html

@app.route("/api/getBusinessTypes/",methods=["GET","POST"])
def getBusinessTypes():
    db,cursor=database()
    query="select distinct(businessType) from bom"
    cursor.execute(query)
    result=cursor.fetchall()
    businessType=[]
    if result:
        for row in result:
            businessType.append(row[0])
    query2="select id,name,level from warehouses"
    cursor.execute(query2)
    result2=cursor.fetchall()
    warehouses=[]
    if result2:
        for row in result2:
            temp={"id":row[0],"name":row[1],"level":row[2]}
            warehouses.append(temp)
    return jsonify({"businessType":businessType,"warehouses":warehouses})

@app.route("/api/getBussinessTypeBom/<data>",methods=["GET","POST"])
def getBussinessTypeBom(data):
    db,cursor=database()
    query="select id,partNo,nomenclature,nsn,supplier,type from bom where businessType=%s"
    cursor.execute(query,(data,))
    result=cursor.fetchall()
    response=[]
    if result:
        for row in result:
            temp={"id":row[0],"partNo":row[1],"nomenclature":row[2],"nsn":row[3],"supplier":row[4],"type":row[5]}
            response.append(temp)
    return jsonify({"response":response})

@app.route("/api/uimPallots/<data>",methods=["GET","POST"])
def itemsSerialization(data):
    db,cursor=database()
    pallots=[]
    query="select id,name,refferenceId from pallots where status=%s and warehouseId=%s"
    cursor.execute(query,('empty',data))
    result=cursor.fetchall()
    for row in result:
        temp={"id":row[0],"name":row[1],"refferenceId":row[2]}
        pallots.append(temp)
    locations=[]
    query2="select id,name from locations where refferenceId=%s"
    cursor.execute(query2,(data,))
    result2=cursor.fetchall()
    if result2:
        for row in result2:
            temp={"id":row[0],"name":row[1]}
            locations.append(temp)
    return jsonify({"pallots":pallots,"locations":locations})
    
@app.route("/api/equipmentBins/<data>",methods=["GET","POST"])
def equipmentBins(data):
    db,cursor=database()
    bins=[]
    query0="select id,refferenceId from bins where status=%s and warehouseId=%s"
    cursor.execute(query0,('empty',data))
    result0=cursor.fetchall()
    for row in result0:
        temp={"id":row[0],"refferenceId":row[1]}
        bins.append(temp)
    pallots=[]
    query="select id,name,refferenceId from pallots where status=%s and warehouseId=%s or status=%s and warehouseId=%s"
    cursor.execute(query,('empty',data,'partiallyFilled',data))
    result=cursor.fetchall()
    for row in result:
        temp={"id":row[0],"name":row[1],"refferenceId":row[2]}
        pallots.append(temp)
    locations=[]
    query2="select id,name from locations where refferenceId=%s"
    cursor.execute(query2,(data,))
    result2=cursor.fetchall()
    if result2:
        for row in result2:
            temp={"id":row[0],"name":row[1]}
            locations.append(temp)
    return jsonify({"pallots":pallots,"locations":locations,"bins":bins})

@app.route("/api/stockIn/",methods=["GET","POST"])
def stockIn():
    db,cursor=database()
    data=request.get_data()
    data = json.loads(data)
    currentDay = datetime.now().day
    currentMonth = datetime.now().month
    currentYear = datetime.now().year
    currentHour = datetime.now().hour
    currentMinute = datetime.now().minute
    currentSecond = datetime.now().second
    code=str(currentDay)+str(currentMonth)+str(currentYear)+str(currentHour)+str(currentMinute)+str(currentSecond)+'7378'
    warehouse=data["warehouse"]
    warehouse=warehouse.split("|")
    totalItems=int(data["noOfEquipment"])+int(data["noOfPallot"])
    tempList=[str(i) for i in data["uimPartNos"]]+[str(i) for i in data["equipPartNos"]]
    allItems=",".join(tempList)
    query="insert into stockin(sgd, transactionalNumber, truckNumber, warehouse, businessTypes, date, items, quantity, uimDocumentPath, equipmentDocumentPath) values(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
    values=(code,data["shipmentNumber"],data["truckNumber"],warehouse[0],data["businessTypes"],data["receivingDate"],allItems,totalItems,"","")
    cursor.execute(query,values)
    print(data)
    if(warehouse[1]=="parts"):
        for k in range(int(data["noOfPallot"])):
            for i in range(len(data["uimItemWithSerialNo"][k])):
                for j in range(len(data["uimItemWithSerialNo"][k][i]["boxId"])):
                     #type==>pallot
                    query1="insert into locationStorage(serialNo, partNo, type, reference) values(%s,%s,%s,%s)"
                    values1=(data["uimItemWithSerialNo"][k][i]['boxId'][j],data["uimPartNos"][k],data["uimItemWithSerialNo"][k][i]["pallotId"],data["uimItemWithSerialNo"][k][i]["loc"])
                    cursor.execute(query1,values1)
                    query3="update locations set status=%s where id=%s"
                    cursor.execute(query3,("partiallyFilled",data["uimItemWithSerialNo"][k][i]["loc"]))
        for k in range(int(data["noOfEquipment"])):
            for i in range(len(data["equipmentItemWithSerialNo"][k])):
                if data["equipmentItemWithSerialNo"][k][i]["type"]=="individual":
                    query2="insert into locationStorage(serialNo, partNo, type, reference) values(%s,%s,%s,%s)"
                    values2=(data["equipmentItemWithSerialNo"][k][i]['serailNo'],data["equipPartNos"][k],data["equipmentItemWithSerialNo"][k][i]["type"],data["equipmentItemWithSerialNo"][k][i]["loc"])
                    cursor.execute(query2,values2)
                    query4="update locations set status=%s where id=%s"
                    cursor.execute(query4,("partiallyFilled",data["equipmentItemWithSerialNo"][k][i]["loc"]))
                else:
                    print(data["equipmentItemWithSerialNo"][k])
                    for j in range(len(data["equipmentItemWithSerialNo"][k][i]['serialNo'])):
                        query2="insert into locationStorage(serialNo, partNo, type, reference) values(%s,%s,%s,%s)"
                        values2=(data["equipmentItemWithSerialNo"][k][i]['serialNo'][j],data["equipPartNos"][k],data["equipmentItemWithSerialNo"][k][i]["type"],data["equipmentItemWithSerialNo"][k][i]["loc"])
                        cursor.execute(query2,values2)
                        query4="update locations set status=%s where id=%s"
                        cursor.execute(query4,("partiallyFilled",data["equipmentItemWithSerialNo"][k][i]["loc"]))
        db.commit()
    elif(warehouse[1]=="pallots"):
        for k in range(int(data["noOfPallot"])):
            for i in range(len(data["uimItemWithSerialNo"][k])):
                for j in range(len(data["uimItemWithSerialNo"][k][i]["boxId"])):
                    #type==>pallot
                    query1="insert into pallotsStorage(serialNo, partNo, type, reference) values(%s,%s,%s,%s)"
                    values1=(data["uimItemWithSerialNo"][k][i]['boxId'][j],data["uimPartNos"][k],data["uimItemWithSerialNo"][k][i]["pallotId"],data["uimItemWithSerialNo"][k][i]["pallot"])
                    cursor.execute(query1,values1)
                    query3="select status from pallots where refferenceId=%s"
                    cursor.execute(query3,(data["uimItemWithSerialNo"][k][i]["loc"],))
                    result=cursor.fetchall()
                    status="fullyFilled"
                    if result:
                        for row in result:
                            if row[0]=="empty":
                                status="partiallyFilled"
                    query5="update locations set status=%s where id=%s"
                    cursor.execute(query5,(status,data["uimItemWithSerialNo"][k][i]["loc"]))
                    query7="update pallots set status=%s where id=%s"
                    cursor.execute(query7,("fullyFilled",data["uimItemWithSerialNo"][k][i]["pallot"]))
        for k in range(int(data["noOfEquipment"])):
            for i in range(len(data["equipmentItemWithSerialNo"][k])):
                if data["equipmentItemWithSerialNo"][k][i]["type"]=="individual":
                    query2="insert into pallotsStorage(serialNo, partNo, type, reference) values(%s,%s,%s,%s)"
                    values2=(data["equipmentItemWithSerialNo"][k][i]['serailNo'],data["equipPartNos"][k],data["equipmentItemWithSerialNo"][k][i]["type"],data["equipmentItemWithSerialNo"][k][i]["pallot"])
                    cursor.execute(query2,values2)
                    query4="update locations set status=%s where id=%s"
                    cursor.execute(query4,("partiallyFilled",data["equipmentItemWithSerialNo"][k][i]["loc"]))
                    query6="update pallots set status=%s where id=%s"
                    cursor.execute(query6,("partiallyFilled",data["equipmentItemWithSerialNo"][k][i]["pallot"]))
                else:
                    for j in range(len(data["equipmentItemWithSerialNo"][k][i]['serialNo'])):
                        query2="insert into pallotsStorage(serialNo, partNo, type, reference) values(%s,%s,%s,%s)"
                        print(data["equipmentItemWithSerialNo"][k][i]['serialNo'][k][j])
                        values2=(data["equipmentItemWithSerialNo"][k][i]['serialNo'][k][j],data["equipPartNos"][k],data["equipmentItemWithSerialNo"][k][i]["type"],data["equipmentItemWithSerialNo"][k][i]["pallot"])
                        cursor.execute(query2,values2)
                        query4="update locations set status=%s where id=%s"
                        cursor.execute(query4,("partiallyFilled",data["equipmentItemWithSerialNo"][k][i]["loc"]))
                        query6="update pallots set status=%s where id=%s"
                        cursor.execute(query6,("partiallyFilled",data["equipmentItemWithSerialNo"][k][i]["pallot"]))
        db.commit()
    elif(warehouse[1]=="bins"):
        for k in range(int(data["noOfPallot"])):
            for i in range(len(data["uimItemWithSerialNo"][k])):
                query9="select sgd,refference,refferenceId,warehouseId from bins where refferenceId=%s limit 1"
                cursor.execute(query9,(data["uimItemWithSerialNo"][k][i]["pallot"],))
                result2=cursor.fetchone()
                sgd=""
                currentBinId=0
                if result2:
                    sgd=result2[0]
                    sgd=sgd.rstrip(sgd[-1])
                    query11="delete from bins where refferenceId=%s"
                    cursor.execute(query11,(data["uimItemWithSerialNo"][k][i]["pallot"],))
                    db.commit()
                    query1122="select id from bins order by id desc limit 1"
                    cursor.execute(query1122)
                    result1122=cursor.fetchone()
                    if result1122:currentBinId=int(result1122[0])
                    else:currentBinId=0
                    print(data)
                    for l in range(len(data["uimItemWithSerialNo"][k][i]["boxId"])):
                        query13="insert into bins(sgd, refference, refferenceId, warehouseId, status, quantity, storageType) values(%s,%s,%s,%s,%s,%s,%s)"
                        values13=(str(sgd)+str(l),result2[1],result2[2],result2[3],"fullyFilled",1,"uimBom")
                        cursor.execute(query13,values13)
                for j in range(len(data["uimItemWithSerialNo"][k][i]["boxId"])):
                    #type==>pallot
                    query1="insert into binstorage(serialNo, partNo, type, reference,pallotId) values(%s,%s,%s,%s,%s)"
                    currentBinId+=1
                    values1=(data["uimItemWithSerialNo"][k][i]['boxId'][j],data["uimPartNos"][k],data["uimItemWithSerialNo"][k][i]["pallotId"],str(currentBinId),data["uimItemWithSerialNo"][k][i]["pallot"])
                    cursor.execute(query1,values1)
                    query11a="insert into UIMStockInItems(sgd, pallotNo, serialNo) values(%s,%s,%s)"
                    cursor.execute(query11a,(code,data["uimItemWithSerialNo"][k][i]["pallotId"],data["uimItemWithSerialNo"][k][i]['boxId'][j]))
                    query3="select status from pallots where refferenceId=%s"
                    cursor.execute(query3,(data["uimItemWithSerialNo"][k][i]["loc"],))
                    result=cursor.fetchall()
                    status="fullyFilled"
                    if result:
                        for row in result:
                            if row[0]=="empty":
                                status="partiallyFilled"
                    query5="update locations set status=%s where id=%s"
                    cursor.execute(query5,(status,data["uimItemWithSerialNo"][k][i]["loc"]))
                    query7="update pallots set status=%s where id=%s"
                    cursor.execute(query7,("fullyFilled",data["uimItemWithSerialNo"][k][i]["pallot"]))
        for k in range(int(data["noOfEquipment"])):
            for i in range(len(data["equipmentItemWithSerialNo"][k])):
                query10="select count(id) from bins where refferenceId=%s"
                cursor.execute(query10,(data["equipmentItemWithSerialNo"][k][i]["pallot"],))
                result3=cursor.fetchone()
                sgd=""
                if result3:
                    if int(result3[0])>9 or int(result3[0])<9:
                        query14="select sgd,refference,refferenceId,warehouseId from bins where refferenceId=%s limit 1"
                        cursor.execute(query14,(data["equipmentItemWithSerialNo"][k][i]["pallot"],))
                        result4=cursor.fetchone()
                        query12="delete from bins where refferenceId=%s"
                        cursor.execute(query12,(data["equipmentItemWithSerialNo"][k][i]["pallot"],))
                        db.commit()
                        sgd=""
                        if result4:
                            sgd=result4[0]
                            sgd=sgd.rstrip(sgd[-1])
                            for l in range(9):
                                query16="insert into bins(sgd, refference, refferenceId, warehouseId, status, quantity, storageType) values(%s,%s,%s,%s,%s,%s,%s)"
                                values16=(str(sgd)+str(l),result4[1],result4[2],result4[3],"empty",1,"")
                                cursor.execute(query16,values16)
                            db.commit()
            for i in range(len(data["equipmentItemWithSerialNo"][k])):
                query8="select id from bins where refferenceId=%s and status='empty'"
                cursor.execute(query8,(data["equipmentItemWithSerialNo"][k][i]["pallot"],))
                result6=cursor.fetchall()
                bins=[]
                print(result6)
                if result6:
                    for row in result6:
                        bins.append(row[0])
                if data["equipmentItemWithSerialNo"][k][i]["type"]=="individual":
                    for n in range(int(data["equipmentItemWithSerialNo"][k][i]["bin"])):
                        query2="insert into binstorage(serialNo, partNo, type, reference,qty,pallotId) values(%s,%s,%s,%s,%s,%s)"
                        values2=(data["equipmentItemWithSerialNo"][k][i]['serailNo'],data["equipPartNos"][k],data["equipmentItemWithSerialNo"][k][i]["type"],bins[n],1,data["equipmentItemWithSerialNo"][k][i]["pallot"])
                        cursor.execute(query2,values2)
                        query11c="insert into EquipStockInItems(sgd, serialNo) values(%s,%s)"
                        cursor.execute(query11c,(code,data["equipmentItemWithSerialNo"][k][i]['serailNo']))
                        query6="update bins set status=%s where id=%s"
                        cursor.execute(query6,("fullyFilled",bins[n]))
                        db.commit()  
                    query4="update locations set status=%s where id=%s"
                    cursor.execute(query4,("partiallyFilled",data["equipmentItemWithSerialNo"][k][i]["loc"]))
                    query6="update pallots set status=%s where id=%s"
                    cursor.execute(query6,("partiallyFilled",data["equipmentItemWithSerialNo"][k][i]["pallot"]))
                else:
                    for n in range(int(data["equipmentItemWithSerialNo"][k][i]["bins"])):
                        query2="insert into binstorage(serialNo, partNo, type, reference,qty,pallotId) values(%s,%s,%s,%s,%s,%s)"
                        values2=(data["equipmentItemWithSerialNo"][k][i]['serialNo'][k][i],data["equipPartNos"][k],data["equipmentItemWithSerialNo"][k][i]["type"],bins[n],data["equipmentItemWithSerialNo"][k][i]["bins"],data["equipmentItemWithSerialNo"][k][i]["pallot"])
                        cursor.execute(query2,values2)
                        query11b="insert into EquipStockInItems(sgd, serialNo) values(%s,%s)"
                        cursor.execute(query11b,(code,data["equipmentItemWithSerialNo"][k][i]['serialNo'][k][i]))
                        query6="update bins set status=%s where id=%s"
                        cursor.execute(query6,("fullyFilled",bins[n]))   
                    query4="update locations set status=%s where id=%s"
                    cursor.execute(query4,("partiallyFilled",data["equipmentItemWithSerialNo"][k][i]["loc"]))
                    query6="update pallots set status=%s where id=%s"
                    cursor.execute(query6,("partiallyFilled",data["equipmentItemWithSerialNo"][k][i]["pallot"]))        
        db.commit()     
    else:pass
    query="select name from warehouses where id=%s"
    cursor.execute(query,(data["warehouse"],))
    result=cursor.fetchone()
    sendStockInEmail(data["businessTypes"],result[0],code)
    return jsonify({"sgd":code})

@app.route("/api/uploadStockinDocs/<code>",methods=["GET","POST"])
def uploadRFQDocument(code):
    db,cursor = database()
    try:
        file=request.files["uimStockDocument"]
        fileName=file.filename
        temp=fileName.split(".")
        format=temp[1]
        #file.save(os.path.join("/root/var/www/ajcl/aviationSystem/documents/", secure_filename(str(code)+format)))
        file.save(os.path.join("E:\docsTemp", secure_filename(str(code)+"UIM"+"."+format)))
        query="update stockin set uimDocumentPath=%s where sgd=%s"
        cursor.execute(query,(str(code)+"UIM"+"."+format,str(code)))
    except:pass
    #File 2
    try:
        file2=request.files["equipStockDocument"]
        fileName2=file2.filename
        temp2=fileName2.split(".")
        format2=temp2[1]
        #file.save(os.path.join("/root/var/www/ajcl/aviationSystem/documents/", secure_filename(str(code)+format)))
        file2.save(os.path.join("E:\docsTemp", secure_filename(str(code)+"EQUIP"+"."+format2)))
        query2="update stockin set equipmentDocumentPath=%s where sgd=%s"
        cursor.execute(query2,(str(code)+"EQUIP"+"."+format2,str(code)))
    except:pass
    db.commit()
    return redirect("https://google.com")

@app.route("/api/getIndustry/",methods=["GET","POST"])
def getIndustry():
    db,cursor = database()
    query="select distinct(industry) from consignee"
    cursor.execute(query)
    result=cursor.fetchall()
    industry=[]
    if result:
        for row in result:
            industry.append(row[0])
    query2="select distinct(businessType) from bom"
    cursor.execute(query2)
    result2=cursor.fetchall()
    businessType=[]
    if result2:
        for row in result2:
            businessType.append(row[0])
    return jsonify({"industry":industry,"businessType":businessType})

@app.route("/api/addConsignee/",methods=["GET","POST"])
def addConsignee():
    db,cursor=database()
    data=request.get_data()
    data = json.loads(data)
    query="select id from consignee where name=%s"
    cursor.execute(query,(data["consigneeName"],))
    result=cursor.fetchone()
    if result:
        return jsonify({"response":"exist"})
    else:
        query2="insert into consignee(industry, name, address, date, contact, businessType) values(%s,%s,%s,%s,%s,%s)"
        cursor.execute(query2,(data["industryName"],data["consigneeName"],data["commenceAddress"],data["commenceDate"],data["contact"],data["businessType"]))
        db.commit()
        return jsonify({"response":"success"})

@app.route("/api/getConsignees/",methods=["GET","POST"])
def getConsignees():
    db,cursor=database()
    query="select * from consignee"
    cursor.execute(query)
    result=cursor.fetchall()
    response=[]
    if result:
        for row in result:
            temp={"id":row[0], "industry":row[1], "name":row[2], "address":row[3], "date":row[4], "contact":row[5], "businessType":row[6]}
            response.append(temp)
    return jsonify({"response":response})

@app.route("/api/getWarehouseLocations/<warehouse>",methods=["GET","POST"])
def getWarehouseLocations(warehouse):
    db,cursor=database()
    query="select id,name from locations where refferenceId=%s"
    cursor.execute(query,(warehouse,))
    result=cursor.fetchall()
    locations=[]
    if result:
        for row in result:
            temp={"id":row[0],"name":row[1]}
            locations.append(temp)
    query2="select id,name,industry from consignee"
    cursor.execute(query2)
    result2=cursor.fetchall()
    consignees=[]
    if result2:
        for row in result2:
            temp={"id":row[0],"name":row[1],"industry":row[2]}
            consignees.append(temp)
    return jsonify({"locations":locations,"consignees":consignees})

@app.route("/api/getWarehousePallots/<warehouse>",methods=["GET","POST"])
def getWarehousePallots(warehouse):
    db,cursor=database()
    query="select id,name from pallots where warehouseId=%s"
    cursor.execute(query,(warehouse,))
    result=cursor.fetchall()
    locations=[]
    if result:
        for row in result:
            temp={"id":row[0],"name":row[1]}
            locations.append(temp)
    query2="select id,name,industry from consignee"
    cursor.execute(query2)
    result2=cursor.fetchall()
    consignees=[]
    if result2:
        for row in result2:
            temp={"id":row[0],"name":row[1],"industry":row[2]}
            consignees.append(temp)
    return jsonify({"locations":locations,"consignees":consignees})

@app.route("/api/getLocationStorage/",methods=["GET","POST"])
def getLocationStorage():
    db,cursor=database()
    data=request.get_data()
    data = json.loads(data)
    query="select bom.partNo,bom.nomenclature,locationstorage.partNo as name,count(*),bom.id from locationstorage INNER JOIN bom ON locationstorage.partNo = bom.id where locationstorage.reference=%s group by locationstorage.partNo;"
    cursor.execute(query,(data["location"],))
    result=cursor.fetchall()
    storage=[]
    if result:
        for row in result:
            temp={"partNo":row[0],"name":row[1],"quantity":row[3],"id":row[4]}
            storage.append(temp)
    return jsonify({"storage":storage})

@app.route("/api/getPallotStorage/",methods=["GET","POST"])
def getPallotStorage():
    db,cursor=database()
    data=request.get_data()
    data = json.loads(data)
    query="select bom.partNo,bom.nomenclature,pallotsstorage.partNo as name,count(*),bom.id as counts from pallotsstorage INNER JOIN bom ON pallotsstorage.partNo = bom.id where pallotsstorage.reference=%s group by pallotsstorage.partNo;"
    cursor.execute(query,(data["location"],))
    result=cursor.fetchall()
    storage=[]
    if result:
        for row in result:
            temp={"partNo":row[0],"name":row[1],"quantity":row[3],"id":row[4]}
            storage.append(temp)
    return jsonify({"storage":storage})

@app.route("/api/getBinStorage/",methods=["GET","POST"])
def getBinStorage():
    db,cursor=database()
    data=request.get_data()
    data = json.loads(data)
    query="select bom.partNo,bom.nomenclature,binstorage.partNo as name,count(distinct serialNo) from binstorage inner join bom on binstorage.partNo=bom.id where pallotId=%s group by partNo;"
    cursor.execute(query,(data["location"],))
    result=cursor.fetchall()
    storage=[]
    if result:
        for row in result:
            temp={"partNo":row[0],"name":row[1],"quantity":row[3],"id":row[2]}
            storage.append(temp)
    return jsonify({"storage":storage})

@app.route("/api/stockOut/",methods=["GET","POST"])
def stockOut():
    db,cursor=database()
    data=request.get_data()
    data = json.loads(data)
    current_date = dateLib.today()
    currentDay = datetime.now().day
    currentMonth = datetime.now().month
    currentYear = datetime.now().year
    currentHour = datetime.now().hour
    currentMinute = datetime.now().minute
    currentSecond = datetime.now().second
    end=data["consignees"]
    code=str(currentDay)+str(currentMonth)+str(currentYear)+str(currentHour)+str(currentMinute)+str(currentSecond)+str(end)
    print(data)
    query0="select level,name from warehouses where id=%s"
    cursor.execute(query0,(data["warehouses"],))
    result=cursor.fetchone()
    warehouseName=result[1]
    level=result[0]
    table=""
    if level=="parts":
        table="locations"
        table2="locationstorage"
    elif level=="pallots":
        table="pallots"
        table2="pallotsstorage"
    elif level=="bins":
        table="bins"
        table2="binstorage"
    else:table=""
    for k,v in enumerate(data["items"]):
        print("Pallot ",v)
        if bool(data["items"][v]):
            for i,j in enumerate(data["items"][v]):
                print("Pallot "+str(v)+" PartNo "+str(j))
                # query="insert into assignedItems(date, sgd, consignee, partNo, quantity, warehouse, refference) values(%s,%s,%s,%s,%s,%s,%s)"
                # print("Print ",j)
                # values=(current_date,code,data["consignees"],j,data["items"][v][j],data["warehouses"],v)
                serialNos=[]
                # cursor.execute(query,values)
                for l in range(int(data["items"][v][j])):
                    print("Pallot "+str(v)+" PartNo "+str(j)+" Q "+str(l))
                    query2="select id,serialNo from "+table2+" where partNo=%s and pallotId=%s order by id asc limit 1"
                    cursor.execute(query2,(j,v))
                    result2=cursor.fetchone()
                    serialNos.append(result2[1])
                    if level=="bins":
                        query3a="select id,reference from "+table2+" where partNo=%s and serialNo=%s and pallotId=%s order by id asc"
                        cursor.execute(query3a,(j,result2[1],v))
                        result3=cursor.fetchall()
                        if result3:
                            for row3 in result3:
                                query3="delete from "+table2+" where id=%s"
                                cursor.execute(query3,(row3[0],))
                                query3="update "+table+" set status=%s where id=%s"
                                print("Bin Reference: "+str(row3[1]))
                                cursor.execute(query3,("empty",row3[1]))
                                db.commit()
                        else:
                            query3="delete from "+table2+" where id=%s"
                            cursor.execute(query3,(result2[0],))
                            db.commit()
                            query3="update "+table+" set status=%s where id=%s"
                            print("Bin Reference: "+str(result2[1]))
                            cursor.execute(query3,("empty",result2[1]))
                            db.commit()
                    else:
                        query3="delete from "+table2+" where id=%s"
                        print("Bin Reference: "+str(result2[1]))
                        cursor.execute(query3,(result2[0],))
                        db.commit()
                    # if level=="bins":
                    #     query3="update "+table+" set status=%s where id=%s"
                    #     cursor.execute(query3,("empty",result2[1]))
                    db.commit()
                print(v)
                if table=="bins":table3="pallots"
                else:table3=table
                query4="update "+table3+" set status=%s where id=%s"
                cursor.execute(query4,("partiallyFilled",v))
                db.commit()
                serialNo=",".join(serialNos)
                query="insert into assignedItems(date, sgd, consignee, partNo, quantity, warehouse, refference, serialNos, truckNumber) values(%s,%s,%s,%s,%s,%s,%s,%s,%s)"
                print("Print ",j)
                values=(current_date,code,data["consignees"],j,data["items"][v][j],data["warehouses"],v,str(serialNo),data["truckNumber"])
                cursor.execute(query,values)
                db.commit()
    if level=="bins":
        query="select id,refferenceId from pallots where warehouseId=%s"
        cursor.execute(query,(data["warehouses"],))
        result=cursor.fetchall()
        if result:
            for row in result:
                query2="select id from bins where status='fullyFilled' and refferenceId=%s"
                cursor.execute(query2,(row[0],))
                result2=cursor.fetchall()
                if result2:pass
                else:
                    query3="update pallots set status=%s where id=%s"
                    cursor.execute(query3,('empty',row[0]))
    elif level=="pallots":
        query="select id,refferenceId from pallots where warehouseId=%s"
        cursor.execute(query,(data["warehouses"],))
        result=cursor.fetchall()
        if result:
            for row in result:
                query2="select id from pallotsstorage where reference=%s"
                cursor.execute(query,(row[0]))
                result=cursor.fetchall()
                if result:pass
                else:
                    query3="update pallots set status=%s where id=%s"
                    cursor.execute(query3,('empty',row[0]))
    else:pass
    sendStockOutEmail(data["businessType"],warehouseName,code)
    return jsonify({"response":"success","sgd":code})

@app.route("/api/assignedEquipment/",methods=["GET","POST"])
def assignedEquipment():
    db,cursor=database()
    data=request.get_data()
    data = json.loads(data)
    query="select id, sgd, partNo, quantity, warehouse,date from assignedItems where consignee=%s"
    cursor.execute(query,(data["consignee"],))
    result=cursor.fetchall()
    equipments=[]
    if result:
        for row in result:
            query2="select partNo,nomenclature from bom where id=%s"
            cursor.execute(query2,(row[2],))
            result2=cursor.fetchone()
            query3="select  name from warehouses where id=%s"
            cursor.execute(query3,(row[4],))
            result3=cursor.fetchone()
            temp={"id":row[0],"sgd":row[1],"partNo":result2[0],"nomenclature":result2[1],"quantity":row[3],"warehouse":result3[0],"date":row[5]}
            equipments.append(temp)
    return jsonify({"equipments":equipments})

@app.route("/api/getWarehouses/<warehouse>",methods=["GET","POST"])
def getWarehouses(warehouse):
    db,cursor=database()
    query="select id,name from locations where refferenceId=%s"
    cursor.execute(query,(warehouse,))
    result=cursor.fetchall()
    locations=[]
    if result:
        for row in result:
            temp={"id":row[0],"name":row[1]}
            locations.append(temp)
    query2="select id,name from warehouses"
    cursor.execute(query2)
    result2=cursor.fetchall()
    warehouses=[]
    if result2:
        for row in result2:
            print(warehouse)
            if warehouse==str(row[0]):pass
            else:
                temp={"id":row[0],"name":row[1]}
                warehouses.append(temp)
    return jsonify({"locations":locations,"warehouses":warehouses})

@app.route("/api/getWarehousePallotsTransfer/<warehouse>",methods=["GET","POST"])
def getWarehousePallotsTransfer(warehouse):
    db,cursor=database()
    query="select id,name from pallots where warehouseId=%s"
    cursor.execute(query,(warehouse,))
    result=cursor.fetchall()
    locations=[]
    if result:
        for row in result:
            temp={"id":row[0],"name":row[1]}
            locations.append(temp)
    query2="select id,name from warehouses"
    cursor.execute(query2)
    result2=cursor.fetchall()
    warehouses=[]
    if result2:
        for row in result2:
            print(warehouse)
            if warehouse==str(row[0]):pass
            else:
                temp={"id":row[0],"name":row[1]}
                warehouses.append(temp)
    return jsonify({"locations":locations,"warehouses":warehouses})

@app.route("/api/w2wTransfer/",methods=["GET","POST"])
def w2wTransfer():
    db,cursor=database()
    data=request.get_data()
    data = json.loads(data)
    current_date = dateLib.today()
    currentDay = datetime.now().day
    currentMonth = datetime.now().month
    currentYear = datetime.now().year
    currentHour = datetime.now().hour
    currentMinute = datetime.now().minute
    currentSecond = datetime.now().second
    end=data["warehousesTransfer"]
    code=str(currentDay)+str(currentMonth)+str(currentYear)+str(currentHour)+str(currentMinute)+str(currentSecond)+str(end)
    print(data)
    query0="select level from warehouses where id=%s"
    cursor.execute(query0,(data["warehouses"],))
    result=cursor.fetchone()
    level=result[0]
    table=""
    if level=="parts":
        table="locations"
        table2="locationstorage"
    elif level=="pallots":
        table="pallots"
        table2="pallotsstorage"
    elif level=="bins":
        table="bins"
        table2="binstorage"
    else:table=""
    for k,v in enumerate(data["items"]):
        print(data["items"])
        if bool(data["items"][v]):
            for i,j in enumerate(data["items"][v]):
                serialNo=[]
                for l in range(int(data["items"][v][j])):
                    print("Pallot "+str(v)+" PartNo "+str(j)+" Q "+str(l))
                    query2="select id,serialNo from "+table2+" where partNo=%s and pallotId=%s order by id asc limit 1"
                    cursor.execute(query2,(j,v))
                    result2=cursor.fetchone()
                    if level=="bins":
                        query3a="select id,reference from "+table2+" where partNo=%s and serialNo=%s and pallotId=%s and type=%s order by id asc"
                        cursor.execute(query3a,(j,result2[1],v,'individual'))
                        result3=cursor.fetchall()
                        if result3:
                            for row3 in result3:
                                query3="delete from "+table2+" where id=%s"
                                cursor.execute(query3,(row3[0],))
                                query3="update "+table+" set status=%s where id=%s"
                                print("Bin Reference: "+str(row3[1]))
                                cursor.execute(query3,("empty",row3[1]))
                                db.commit()
                        else:
                            query3="delete from "+table2+" where id=%s"
                            cursor.execute(query3,(result2[0],))
                            db.commit()
                            query3="update "+table+" set status=%s where id=%s"
                            print("Bin Reference: "+str(result2[1]))
                            cursor.execute(query3,("empty",result2[1]))
                            db.commit()
                    else:
                        query3="delete from "+table2+" where id=%s"
                        print("Bin Reference: "+str(result2[1]))
                        cursor.execute(query3,(result2[0],))
                        db.commit()
                    # query3="delete from "+table2+" where id=%s"
                    # cursor.execute(query3,(result2[0],))
                    # if level=="bins":
                    #     query3="update "+table+" set status=%s where id=%s"
                    #     cursor.execute(query3,("empty",result2[1]))
                    serialNo.append(result2[1])
                    db.commit()
                serailNos=",".join(serialNo)
                query="insert into w2wItems(date, sgd, assign, partNo, quantity, warehouse, refference, serialNumber,truckNumber) values(%s,%s,%s,%s,%s,%s,%s,%s,%s)"
                print("Print j",j)
                values=(current_date,code,data["warehousesTransfer"],j,data["items"][v][j],data["warehouses"],v,serailNos,data["truckNumber"])
                cursor.execute(query,values)
                print(v)
                if table=="bins":table3="pallots"
                else:table3=table
                query4="update "+table3+" set status=%s where id=%s"
                cursor.execute(query4,("partiallyFilled",v))
                db.commit()
    if level=="bins":
        query="select id,refferenceId from pallots where warehouseId=%s"
        cursor.execute(query,(data["warehouses"],))
        result=cursor.fetchall()
        if result:
            for row in result:
                query2="select id from bins where status='fullyFilled' and refferenceId=%s"
                cursor.execute(query2,(row[0],))
                result2=cursor.fetchall()
                if result2:pass
                else:
                    query3="update pallots set status=%s where id=%s"
                    cursor.execute(query3,('empty',row[0]))
    elif level=="pallots":
        query="select id,refferenceId from pallots where warehouseId=%s"
        cursor.execute(query,(data["warehouses"],))
        result=cursor.fetchall()
        if result:
            for row in result:
                query2="select id from pallotsstorage where reference=%s"
                cursor.execute(query,(row[0]))
                result=cursor.fetchall()
                if result:pass
                else:
                    query3="update pallots set status=%s where id=%s"
                    cursor.execute(query3,('empty',row[0]))
    else:pass
    return jsonify({"response":"success","sgd":code})

@app.route("/api/getTransferItems/",methods=["GET","POST"])
def getTransferItems():
    db,cursor=database()
    data=request.get_data()
    data = json.loads(data)
    query="select w2witems.id, w2witems.date, w2witems.sgd, w2witems.assign, w2witems.partNo, w2witems.serialNumber, w2witems.quantity, w2witems.warehouse, w2witems.refference, w2witems.status,bom.partNo,bom.nomenclature from w2witems inner join bom on w2witems.partNo=bom.id where sgd=%s and status='nr';"
    cursor.execute(query,(data["id"],))
    result=cursor.fetchall()
    response=[]
    for row in result:
        serialNo=row[5]
        serialNos=serialNo.split(",")
        for i in serialNos:
            temp={"id":row[0], "date":str(row[1]), "sgd":row[2], "assign":row[3], "partNo":row[4], "serialNumber":i, "quantity":row[6], "warehouse":row[7], "refference":row[8], "status":row[9],"partNumber":row[10],"nomenclature":row[11]}
            response.append(temp)
    query2="select level,id from warehouses where id in (select assign from w2witems where sgd=%s) limit 1"
    cursor.execute(query2,(data["id"],))
    result2=cursor.fetchone()
    return jsonify({"response":response,"level":result2[0],"warehouse":result2[1]})

@app.route("/api/getAvialableStorage/<warehouse>/<level>",methods=["GET","POST"])
def getLocations(warehouse,level):
    db,cursor=database()
    locations=[]
    pallots=[]
    bins=[]
    if level=="parts":
        query="select id,name from locations where refferenceId=%s and status!='fullyFilled'"
        cursor.execute(query,(warehouse,))
        result=cursor.fetchall()
        if result:
            for row in result:
                temp={"id":row[0], "name":row[1]}
                locations.append(temp)
    elif level=="pallots":
        query="select id,name from locations where refferenceId=%s and status!='fullyFilled'"
        cursor.execute(query,(warehouse,))
        result=cursor.fetchall()
        if result:
            for row in result:
                temp={"id":row[0], "name":row[1]}
                locations.append(temp)
        query="select id,name,refferenceId from pallots where warehouseId=%s and status!='fullyFilled'"
        cursor.execute(query,(warehouse,))
        result=cursor.fetchall()
        if result:
            for row in result:
                temp={"id":row[0], "name":row[1],"refference":row[2]}
                pallots.append(temp)
    elif level=="bins":
        query="select id,name from locations where refferenceId=%s and status!='fullyFilled'"
        cursor.execute(query,(warehouse,))
        result=cursor.fetchall()
        if result:
            for row in result:
                temp={"id":row[0], "name":row[1]}
                locations.append(temp)
        query="select id,name,refferenceId from pallots where warehouseId=%s and status!='fullyFilled'"
        cursor.execute(query,(warehouse,))
        result=cursor.fetchall()
        if result:
            for row in result:
                temp={"id":row[0], "name":row[1],"refference":row[2]}
                pallots.append(temp)
        query="select refferenceId,count(*) from bins where warehouseId=%s and status='empty' group by refferenceId;"
        cursor.execute(query,(warehouse,))
        result=cursor.fetchall()
        if result:
            for row in result:
                temp={"refference":row[0],"quantity":row[1]}
                bins.append(temp)
    else:pass
    return jsonify({"locations":locations,"pallots":pallots,"bins":bins})

@app.route("/api/w2wTransferStockIn",methods=["GET","POST"])
def w2wTransferStockIn():
    db,cursor=database()
    data=request.get_data()
    data = json.loads(data)
    currentDay = datetime.now().day
    currentMonth = datetime.now().month
    currentYear = datetime.now().year
    currentHour = datetime.now().hour
    currentMinute = datetime.now().minute
    currentSecond = datetime.now().second
    code=str(currentDay)+str(currentMonth)+str(currentYear)+str(currentHour)+str(currentMinute)+str(currentSecond)
    print(data)
    if data["level"]=="parts":
        query="select id,assign,partNo,serialNumber,quantity,warehouse from w2witems where sgd=%s and status='nr'"
        cursor.execute(query,(data["ti"],))
        result=cursor.fetchall()
        if result:
            for row in result:
                count=0
                serialNos=row[3]
                serialNos=serialNos.split(",")
                for i in range(len(serialNos)):
                    query3="insert into locationstorage(serialNo, partNo, type, reference, status) values(%s,%s,%s,%s,%s)"
                    cursor.execute(query3,(serialNos[count],row[2],"individual",data["locations"][str(serialNos[count])][0],'idel'))
                    count+=1
                    query4="update locations set status=%s where id=%s"
                    cursor.execute(query4,('partiallyFilled',data["locations"][str(row[0])][0]))
                    db.commit()
    elif data["level"]=="pallots":
        query="select id,assign,partNo,serialNumber,quantity,warehouse from w2witems where sgd=%s and status='nr'"
        cursor.execute(query,(data["ti"],))
        result=cursor.fetchall()
        if result:
            for row in result:
                count=0
                serialNos=row[3]
                serialNos=serialNos.split(",")
                for i in range(len(serialNos)):
                    query3="insert into pallotsstorage(serialNo, partNo, type, reference, status) values(%s,%s,%s,%s,%s)"
                    cursor.execute(query3,(serialNos[count],row[2],"individual",data["locations"][str(serialNos[count])][1],'idel'))
                    count+=1
                    query4="update locations set status=%s where id=%s"
                    cursor.execute(query4,('partiallyFilled',data["locations"][str(serialNos[count])][0]))
                    query5="update pallots set status=%s where id=%s"
                    cursor.execute(query5,('partiallyFilled',data["locations"][str(serialNos[count])][1]))
                    db.commit()
    elif data["level"]=="bins":
        query="select id,assign,partNo,serialNumber,quantity,warehouse from w2witems where sgd=%s and status='nr'"
        cursor.execute(query,(data["ti"],))
        result=cursor.fetchall()
        if result:
            for row in result:
                serialNos=row[3]
                serialNos=serialNos.split(",")
                if True:
                    count=0
                    for sn in serialNos:
                        query2="select id from bins where status='empty' and refferenceId=%s and warehouseId=%s limit 1"
                        cursor.execute(query2,(data["locations"][str(sn)][1],row[1]))
                        result2=cursor.fetchone()
                        query3="insert into binstorage(serialNo,partNo,type,status,qty,reference,pallotId) values(%s,%s,%s,%s,%s,%s,%s)"
                        cursor.execute(query3,(sn,row[2],'individual','idel',1,result2[0],data["locations"][str(sn)][1]))
                        count+=1
                        query4="update locations set status=%s where id=%s"
                        cursor.execute(query4,('partiallyFilled',data["locations"][str(sn)][0]))
                        query5="update pallots set status=%s where id=%s"
                        cursor.execute(query5,('partiallyFilled',data["locations"][str(sn)][1]))
                        query6="update bins set status=%s where id=%s"
                        cursor.execute(query6,('fullyFilled',result2[0]))
                        db.commit()
    else:pass
    query="update w2witems set status='r' where sgd=%s"
    cursor.execute(query,(data["ti"],))
    db.commit()
    return jsonify({"response":"success","sgd":code})

@app.route("/api/getStockReturnItems/",methods=["GET","POST"])
def getStockReturnItems():
    db,cursor=database()
    data=request.get_data()
    data = json.loads(data)
    #id, date, sgd, consignee, partNo, quantity, warehouse, refference
    query="select assignedItems.id, assignedItems.date, assignedItems.sgd, assignedItems.consignee, assignedItems.partNo, assignedItems.serialNos, assignedItems.quantity, assignedItems.warehouse, assignedItems.refference,bom.partNo,bom.nomenclature from assignedItems inner join bom on assignedItems.partNo=bom.id where sgd=%s;"
    cursor.execute(query,(data["id"],))
    result=cursor.fetchall()
    response=[]
    if result:
        for row in result:
            serialNumber=row[5]
            serialNumbers=serialNumber.split(",")
            for sn in serialNumbers:
                temp={"serialNo":sn,"id":row[0], "date":str(row[1]), "sgd":row[2], "assign":row[3], "partNo":row[4], "quantity":row[6], "warehouse":row[7], "refference":row[8],"partNumber":row[9],"nomenclature":row[10]}
                response.append(temp)
    query2="select level,id from warehouses where id in (select consignee from assignedItems where sgd=%s) limit 1"
    cursor.execute(query2,(data["id"],))
    result2=cursor.fetchone()
    return jsonify({"response":response,"level":result2[0],"warehouse":result2[1]})

@app.route("/api/getReturnWarehouses",methods=["GET","POST"])
def getReturnWarehouses():
    db,cursor=database()
    query="select id,name,level from warehouses"
    cursor.execute(query)
    result=cursor.fetchall()
    response=[]
    if result:
        for row in result:
            temp={"id":row[0],"name":row[1],"level":row[2]}
            response.append(temp)
    return jsonify({"response":response})

@app.route("/api/storeStockReturn",methods=["GET","POST"])
def storeStockReturn():
    db,cursor=database()
    data=request.get_data()
    data = json.loads(data)
    current_date = dateLib.today()
    currentDay = datetime.now().day
    currentMonth = datetime.now().month
    currentYear = datetime.now().year
    currentHour = datetime.now().hour
    currentMinute = datetime.now().minute
    currentSecond = datetime.now().second
    code=str(currentDay)+str(currentMonth)+str(currentYear)+str(currentHour)+str(currentMinute)+str(currentSecond)+"Return"
    print(data)
    if data["level"]=="parts":
        for i in range(len(data["locations"])):
            query2="select id,consignee, partNo, quantity, warehouse, refference, serialNos from assignedItems where sgd=%s and serialNos like '%"+data["serialNo"][i]+"%'"
            cursor.execute(query2,(data["tid"],))
            result2=cursor.fetchone()
            query3="insert into locationstorage(serialNo, partNo, type, reference, status) values(%s,%s,%s,%s,%s,%s,%s)"
            cursor.execute(query3,(data["serialNo"][i],result2[2],'individual',data["locations"][i],'idel'))
            now=datetime.utcnow()
            query4="insert into returnedItem(date, serialNo, partNo, refference, truckNumber,sgd) values(%s,%s,%s,%s,%s,%s)"
            cursor.execute(query4,(now.strftime("%Y-%m-%d"),data["serialNo"][i],result2[2],result2[0],data["truckNumber"],code))
            query7="update locations set status=%s where id=%s"
            cursor.execute(query7,('partiallyFilled',data["locations"][i]))
            serialNo=result2[6]
            serialNos=serialNo.split(",")
            serialNos.remove(data["serialNo"][i])
            serialNo=",".join(serialNos)
            query8="update assignedItems set serialNos=%s where sgd=%s"
            cursor.execute(query8,(serialNo,data["tid"]))
            db.commit()
    elif data["level"]=="pallots":
        for i in range(len(data["locations"])):
            query2="select id,consignee, partNo, quantity, warehouse, refference, serialNos from assignedItems where sgd=%s and serialNos like '%"+data["serialNo"][i]+"%'"
            cursor.execute(query2,(data["tid"],))
            result2=cursor.fetchone()
            query3="insert into pallotsstorage(serialNo, partNo, type, reference, status) values(%s,%s,%s,%s,%s,%s,%s)"
            cursor.execute(query3,(data["serialNo"][i],result2[2],'individual',data["pallots"][i],'idel'))
            now=datetime.utcnow()
            query4="insert into returnedItem(date, serialNo, partNo, refference,truckNumber,sgd) values(%s,%s,%s,%s,%s,%s)"
            cursor.execute(query4,(now.strftime("%Y-%m-%d"),data["serialNo"][i],result2[2],result2[0],data["truckNumber"],code))
            query6="update pallots set status=%s where id=%s"
            cursor.execute(query6,('partiallyFilled',data["pallots"][i]))
            query7="update locations set status=%s where id=%s"
            cursor.execute(query7,('partiallyFilled',data["locations"][i]))
            serialNo=result2[6]
            serialNos=serialNo.split(",")
            serialNos.remove(data["serialNo"][i])
            serialNo=",".join(serialNos)
            query8="update assignedItems set serialNos=%s where sgd=%s"
            cursor.execute(query8,(serialNo,data["tid"]))
            db.commit()
    elif data["level"]=="bins":
        for i in range(len(data["serialNo"])):
            query="select id from bins where refferenceId=%s and status=%s order by id asc limit 1"
            cursor.execute(query,(data["pallots"][i],'empty'))
            result=cursor.fetchone()
            query2="select id,consignee, partNo, quantity, warehouse, refference, serialNos from assignedItems where sgd=%s and serialNos like '%"+data["serialNo"][i]+"%'"
            cursor.execute(query2,(data["tid"],))
            result2=cursor.fetchone()
            print(result2)
            query3="insert into binstorage(serialNo, partNo, type, reference, status, qty, pallotId) values(%s,%s,%s,%s,%s,%s,%s)"
            cursor.execute(query3,(data["serialNo"][i],result2[2],'individual',result[0],'idel','1',data["pallots"][i]))
            now=datetime.utcnow()
            query4="insert into returnedItem(date, serialNo, partNo, refference, truckNumber, sgd) values(%s,%s,%s,%s,%s,%s)"
            cursor.execute(query4,(now.strftime("%Y-%m-%d"),data["serialNo"][i],result2[2],result2[0],data["truckNumber"], code))
            query5="update bins set status=%s where id=%s"
            cursor.execute(query5,('fullyFilled',result[0]))
            query6="update pallots set status=%s where id=%s"
            cursor.execute(query6,('partiallyFilled',data["pallots"][i]))
            query7="update locations set status=%s where id=%s"
            cursor.execute(query7,('partiallyFilled',data["locations"][i]))
            serialNo=result2[6]
            serialNos=serialNo.split(",")
            print(result2)
            print(serialNo)
            print(serialNos)
            serialNos.remove(data["serialNo"][i])
            print(serialNos)
            serialNo=",".join(serialNos)
            print(serialNo)
            query8="update assignedItems set serialNos=%s where sgd=%s"
            cursor.execute(query8,(serialNo,data["tid"]))
            db.commit()
    else:pass
    print(data)
    query="select name from warehouses where id=%s"
    cursor.execute(query,(data["warehouse"],))
    result=cursor.fetchone()
    print(data["businessType"])
    sendStockReturnEmail(data["businessType"],result[0],code)
    return jsonify({"response":"success","sgd":code})

@app.route("/api/uploadStockOutDocs/<code>",methods=["GET","POST"])
def uploadStockOutDocs(code):
    db,cursor = database()
    file=request.files["stockOutDoc"]
    fileName=file.filename
    temp=fileName.split(".")
    format=temp[1]
    #file.save(os.path.join("/root/var/www/ajcl/aviationSystem/documents/", secure_filename(str(code)+format)))
    file.save(os.path.join("E:\docsTemp", secure_filename(str(code)+"Out"+"."+format)))
    query="update assignedItems set docPath=%s where sgd=%s"
    cursor.execute(query,(str(code)+"Out"+"."+format,str(code)))
    db.commit()
    return redirect("https://google.com")

@app.route("/api/uploadW2wTransferDocs/<code>",methods=["GET","POST"])
def uploadW2wTransferDocs(code):
    db,cursor = database()
    file=request.files["stockOutDoc"]
    fileName=file.filename
    temp=fileName.split(".")
    format=temp[1]
    #file.save(os.path.join("/root/var/www/ajcl/aviationSystem/documents/", secure_filename(str(code)+format)))
    file.save(os.path.join("E:\docsTemp", secure_filename(str(code)+"W2wT"+"."+format)))
    query="update w2witems set transferDocPath=%s where sgd=%s"
    cursor.execute(query,(str(code)+"W2wT"+"."+format,str(code)))
    db.commit()
    return redirect("https://google.com")

@app.route("/api/uploadW2wStoreDocs/<code>",methods=["GET","POST"])
def uploadW2wStoreDocs(code):
    db,cursor = database()
    file=request.files["stockInDoc"]
    fileName=file.filename
    temp=fileName.split(".")
    format=temp[1]
    #file.save(os.path.join("/root/var/www/ajcl/aviationSystem/documents/", secure_filename(str(code)+format)))
    file.save(os.path.join("E:\docsTemp", secure_filename(str(code)+"W2wR"+"."+format)))
    query="update w2witems set recieveDocPath=%s where sgd=%s"
    cursor.execute(query,(str(code)+"W2wR"+"."+format,str(code)))
    db.commit()
    return redirect("https://google.com")

@app.route("/api/uploadReturnDocs/<code>",methods=["GET","POST"])
def uploadReturnDocs(code):
    db,cursor = database()
    file=request.files["stockInDoc"]
    fileName=file.filename
    temp=fileName.split(".")
    format=temp[1]
    #file.save(os.path.join("/root/var/www/ajcl/aviationSystem/documents/", secure_filename(str(code)+format)))
    file.save(os.path.join("E:\docsTemp", secure_filename(str(code)+"Return"+"."+format)))
    query="update returnedItem set docPath=%s where sgd=%s"
    cursor.execute(query,(str(code)+"Return"+"."+format,str(code)))
    db.commit()
    return redirect("https://google.com")

@app.route("/api/registerUser/",methods=["GET","POST"])
def registerUser():
    db,cursor = database()
    # data=request.get_data().decode()
    # data = json.loads(data)
    data=request.form
    if data:
        query1="select * from usersdata where email=%s"
        cursor.execute(query1,(data["email"],))
        result1=cursor.fetchone()
        #print(result1)
        if result1:return jsonify({"response":"Email Already Exist"})
        else:
            password=data["password"].encode()
            f = Fernet(key)
            encryptedPassword = f.encrypt(password)
            name=str(data["email"]).split("@")
            query2="insert into usersData(name,email,businessType,password,status) values(%s,%s,%s,%s,%s)"
            cursor.execute(query2,(name[0],data["email"],data["businessType"],encryptedPassword,'inactive'))
            db.commit()
            return "<script>alert('Employee Registered Successfully');location.reload();</script>"
    else:return jsonify({"response":"Invalid Information"})

@app.route("/api/login/",methods=["GET","POST"])
def login():
    db,cursor = database()
    data=request.get_data().decode()
    data = json.loads(data)
    #print(data["email"])
    # data=request.form
    if data:
        query1="select * from usersdata where email=%s"
        cursor.execute(query1,(data["email"],))
        result1=cursor.fetchone()
        if result1:
            password=bytes(result1[3], 'utf-8')
            f = Fernet(key)
            passw = f.decrypt(password)
            passw=passw.decode("utf-8")
            if passw==data["password"]:return jsonify({"response":"success","businessType":str(result1[4])})
            else:return jsonify({"response":"Incorrect Password"})
        else:return jsonify({"response":"Invalid Email or Password"})
    else:return jsonify({"response":"Invalid Email or Password"})

if __name__=="__main__":
    app.run(port=7701,debug=True)