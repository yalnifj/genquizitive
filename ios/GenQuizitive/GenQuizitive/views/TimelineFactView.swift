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
        
        self.view.layoutIfNeeded()
    }
    
    func loadViewFromNib() -> UIView {
        let bundle = Bundle(for:type(of: self))
        let nib = UINib(nibName: "TimelineFactView", bundle: bundle)
        let view = nib.instantiate(withOwner: self, options: nil)[0] as! UIView
        
        return view
    }

}
