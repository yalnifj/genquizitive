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
    
    func getFriends(onCompletion:@escaping ([UserDetails])->Void) {
        let ref = FIRDatabase.database().reference()
        let userID = FIRAuth.auth()?.currentUser?.uid
        ref.child("friends").child(userID!).observeSingleEvent(of: .value, with: { snapshot in
            var friends = [UserDetails]()
            let userRef = ref.child("users")
            for child in snapshot.children {
                let id = child as! String
                userRef.child(id).observeSingleEvent(of: .value, with: {snap in
                    if snap.value != nil {
                        let userDict = snap.value as! [String: Any?]
                        let details = UserDetails(map: userDict)
                        friends.append(details)
                    }
                })
            }
            onCompletion(friends)
        })
    }
}

class UserDetails {
    var id:String!
    var highScore:Int?
    var numberOfRounds:Int?
    var hasFamilyTree:Bool!
    
    init(map:[String:Any?]) {
        self.id = map["id"] as! String
        self.highScore = map["highScore"] as? Int
        self.numberOfRounds = map["numberOfRounds"] as? Int
        self.hasFamilyTree = map["hasFamilyTree"] as! Bool
    }
    
    func toPersist() -> [String:Any?] {
        var map = [String:Any?]()
        map["id"] = self.id
        map["numberOfRounds"] = self.numberOfRounds
        map["highScore"] = self.highScore
        map["hasFamilyTree"] = self.hasFamilyTree
        
        return map
    }
}
