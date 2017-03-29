//
//  TimelineFactView.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 3/9/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation
import UIKit

class TimelineFactView : UIView {
    var view:UIView!
    @IBOutlet weak var backView: UIView!
    @IBOutlet weak var dayMonthLbl: UILabel!
    @IBOutlet weak var yearLbl: UILabel!
    @IBOutlet weak var ageLbl: UILabel!
    @IBOutlet weak var factLbl: UILabel!
    @IBOutlet weak var placeLbl: UILabel!
    @IBOutlet weak var ageLbl2: UILabel!
    
    var fact:Fact?
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setup()
    }
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        setup()
    }
    
    func setup() {
        view = loadViewFromNib()
        view.frame = bounds
        view.autoresizingMask = UIViewAutoresizing.flexibleWidth
        addSubview(view)
        
        backView.layer.cornerRadius = backView.frame.height * 0.8
        backView.clipsToBounds = true
        
        self.view.layoutIfNeeded()
    }
    
    func loadViewFromNib() -> UIView {
        let bundle = Bundle(for:type(of: self))
        let nib = UINib(nibName: "TimelineFactView", bundle: bundle)
        let view = nib.instantiate(withOwner: self, options: nil)[0] as! UIView
        
        return view
    }

    func showFact(fact:Fact, person:Person) {
        let langService = LanguageService.getInstance()
        var text = ""
        if fact.type != nil {
            text = langService.getFactLabel(factType: fact.type!)
        }
        
        if fact.value != nil {
            text += " \(fact.value!)"
        }
        factLbl.text = text
        
        ageLbl.isHidden = true
        ageLbl2.isHidden = true
        dayMonthLbl.isHidden = true
        yearLbl.isHidden = true
        ageLbl.text = nil
        if fact.date != nil && fact.date!.parsedDate != nil {
            let dateFormatter = DateFormatter()
            if fact.date!.hasDateParts["d"]! {
                dateFormatter.dateFormat = "dd MMM"
                dayMonthLbl.text = dateFormatter.string(from: fact.date!.parsedDate!)
            }
            else if fact.date!.hasDateParts["M"]! {
                dateFormatter.dateFormat = "MMM"
                dayMonthLbl.text = dateFormatter.string(from: fact.date!.parsedDate!)
            } else {
                dayMonthLbl.text = ""
            }
            dateFormatter.dateFormat = "yyyy"
            yearLbl.text = dateFormatter.string(from: fact.date!.parsedDate!)
            
            let birthFacts = person.getFactsByType(type: "http://gedcomx.org/Birth")
            if birthFacts.count > 0 {
                for birth in birthFacts {
                    if birth.date != nil && birth.date!.parsedDate != nil {
                        let diff = fact.date!.parsedDate!.timeIntervalSince(birth.date!.parsedDate!)
                        let age = Int(diff / (60*60*24*365))
                        if age > 0 {
                            ageLbl.text = age.description
                        }
                    }
                }
            }
        }
        
        if fact.place != nil && fact.place!.original != nil {
            placeLbl.isHidden = false
            placeLbl.text = fact.place!.original!
        } else {
            placeLbl.isHidden = true
        }
        
        self.view.layoutIfNeeded()
    }
    
    func showDates(showHide:Bool) {
        if ageLbl.text != nil && ageLbl.text != "" {
            ageLbl.isHidden = showHide
            ageLbl2.isHidden = showHide
        }
        dayMonthLbl.isHidden = showHide
        yearLbl.isHidden = showHide
    }
}
