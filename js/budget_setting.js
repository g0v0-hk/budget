/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


var budget_setting = {
    revenue : {
        header : "香港政府2013年財政收入",
        data : 'resource/revenue.json',
        
        root_div : '#revenue',
        check_depts: false,
        
        bubble : {
            w : 600,
            h : 500,
            
            r_scale_exp : 0.62,
            r_scale_range : [5, 100],
            
            f_gravity : 0.05,
            f_charge_exp : 1.9,
            f_charge_div : 8,
            
            
            tip_pos_xoff : 500,
            tip_pos_yoff : 40
        },
        barchart : {
            
            revise_year : 2012,
            y_label : "財政收入"
            
        }
        
    },
    
    expenditure : {
        header : "香港政府2012年财政支出",
        data : 'resource/budget.json',
        
        root_div : '#expenditure',
        check_depts : true,
        bubble : {
            w : 600,
            h : 500,
            
            r_scale_exp : 0.8,
            r_scale_range : [5, 120],
            f_gravity : 0.05,
            f_charge_exp : 1.9,
            f_charge_div : 8,
            
            tip_pos_xoff : 0,
            tip_pos_yoff : 20
                        
        },
        barchart : {
            
            revise_year : 2013,
            y_label: "財政支出"
            
        }
    }           
}