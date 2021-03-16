/*
 * @Author (s)    :     Krishna Chaitanya
 * @Date          :     15 March 2021
 */

public with sharing class FinancialServicesAccountList {
    
    
    @AuraEnabled(cacheable = true)
	public static List<Account> FinancialServiceAccount(){
        List<Account> finSer = getFinancialAccountList();
        System.debug('---->'+ finSer);
        return finSer;
    }
    
 
    private static List<Account> getFinancialAccountList(){
		List<Account> finSerLst = new List<Account>();

		try{
            finSerLst = [SELECT Id, Name, RecordTypeId, Industry, OwnerId, Ownership, Phone, Website, AnnualRevenue 
                         FROM Account
                         WHERE Industry = 'Financial Services'];

		} catch (Exception exp){
            throw new AuraHandledException('No Records Found: ' + exp.getMessage()); 
        }

		return finSerLst;
	}

}