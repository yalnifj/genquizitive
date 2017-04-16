//
//  FirebaseService.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 4/14/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation
import Firebase

class FirebaseService {
    static var instance:FirebaseService?
    
    var firebaseUser:FIRUser?
    
    private init() {
        
    }
    
    static func getInstance() -> FirebaseService {
        if instance == nil {
            instance = FirebaseService()
        }
        return instance!
    }
}
