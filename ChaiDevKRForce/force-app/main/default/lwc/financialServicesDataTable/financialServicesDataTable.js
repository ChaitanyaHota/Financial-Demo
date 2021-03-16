import { LightningElement, track,wire,api } from 'lwc';
import financialAccounts from '@salesforce/apex/FinancialServicesAccountList.FinancialServiceAccount';
import { NavigationMixin } from "lightning/navigation";
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

const columnList = [
    {label: 'Account Name', fieldName: 'Name', type: 'url',sortable: 'true',
    typeAttributes: {
        label: { fieldName: 'Name' },name: "gotoAccount", variant: "base"}
    },
    {label: 'RecordTypeId', fieldName: 'RecordTypeId'},
    {label: 'Industry', fieldName: 'Industry'},
    {label: 'OwnerId', fieldName: 'OwnerId'},
    {label: 'Ownership', fieldName: 'Ownership'},
    {label: 'Phone', fieldName: 'Phone',type: 'Phone',editable: true},
    {label: 'Website', fieldName: 'Website'},
    {label: 'AnnualRevenue', fieldName: 'AnnualRevenue'}
];

export default class LightningDataTable extends  NavigationMixin(LightningElement)   {
    @track accountList;
    @track columnList = columnList;
    saveDraftValues = [];
    @api sortedDirection = 'asc';
    @api sortedBy = 'Name';
    @api searchKey = '';


    @wire(financialAccounts,{searchKey: '$searchKey', sortBy: '$sortedBy', sortDirection: '$sortedDirection'})
    wiredResult({error,data}){
        if(data){
           
            this.accountList = data;            
        }
        else if (error){
            this.accountList  = undefined;
        }
    }

    handleSave(event) {
        this.saveDraftValues = event.detail.draftValues;
        const recordInputs = this.saveDraftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });

        // Updating the records using the UiRecordAPi
        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(res => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Records Updated Successfully!!',
                    variant: 'success'
                })
            );
            this.saveDraftValues = [];
            return this.refresh();
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'An Error Occured!!',
                    variant: 'error'
                })
            );
        }).finally(() => {
            this.saveDraftValues = [];
        });
    }

    // This function is used to refresh the table once data updated
    async refresh() {
        await refreshApex(this.accountList);
    }

//This function is used to search based on the Name of the account
    handleSearchResult(event) {
        const searchKey = event.target.value;
        
        return refreshApex(this.result);
     
     
    }

    handleRowAction(event){
        if (event.detail.action.name === "gotoAccount") {
            this[NavigationMixin.GenerateUrl]({
                type: "standard__recordPage",
                attributes: {
                    recordId: event.detail.row.Id,
                    actionName: "view"
                }
            }).then((url) => {
                window.open(url, "_blank");
            });
        }
    }
  
}