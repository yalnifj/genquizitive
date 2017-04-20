//
//  FirebaseService.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 4/14/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation
import Firebase
import GoogleSignIn

class FirebaseService {
    static var instance:FirebaseService?
    
    var firebaseUser:FIRUser?
    var userDetails:UserDetails?
    
    private init() {
    }
    
    static func getInstance() -> FirebaseService {
        if instance == nil {
            instance = FirebaseService()
        }
        return instance!
    }
    
    func persistGoogleUser(user:GIDGoogleUser, hasFamilyTree:Bool) {
        let ref = FIRDatabase.database().reference()
        let userID = FIRAuth.auth()?.currentUser?.uid
        ref.child("users/\(userID)").observeSingleEvent(of: .value, with: { snapshot in
            if snapshot.value == nil {
                var map = [String:Any?]()
                map["id"] = userID
                map["highScore"] = 0
                map["numberOfRounds"] = 0
                map["hasFamilyTree"] = hasFamilyTree
                map["name"] = user.profile.name
                map["photoUrl"] = user.profile.imageURL(withDimension: 100)
                map["lastLogin"] = (Date()).timeIntervalSince1970
                ref.child("users/\(userID)").setValue(map)
                self.userDetails = UserDetails(map: map)
            } else {
                self.userDetails = UserDetails(map: snapshot.value as! [String:Any?])
                ref.child("users/\(userID)/lastLogin").setValue((Date()).timeIntervalSince1970)
                if hasFamilyTree {
                    self.userDetails?.hasFamilyTree = hasFamilyTree
                    ref.child("users/\(userID)/hasFamilyTree").setValue(hasFamilyTree)
                }
            }
        })
    }
    
    func getUserDetailsById(userId:String, onCompletion:@escaping (UserDetails?)->Void) {
        let ref = FIRDatabase.database().reference().child("users/\(userId)").observeSingleEvent(of: .value, with: { snapshot
            in
            if snapshot.value != nil {
                let map = snapshot.value as! [String:Any?]
                let userDetails = UserDetails(map: map)
                onCompletion(userDetails)
            } else {
                onCompletion(nil)
            }
        })
    }
    
    func getFriends(onCompletion:@escaping ([UserDetails])->Void) {
        // TODO - Add friend Paging
        let ref = FIRDatabase.database().reference()
        let userID = FIRAuth.auth()?.currentUser?.uid
        ref.child("friends").child(userID!).observeSingleEvent(of: .value, with: { snapshot in
            var friends = [UserDetails]()
            let userRef = ref.child("users")
            let queue = DispatchQueue.global()
            let group = DispatchGroup()
            for child in snapshot.children {
                let id = child as! String
                group.enter()
                userRef.child(id).observeSingleEvent(of: .value, with: {snap in
                    if snap.value != nil {
                        let userDict = snap.value as! [String: Any?]
                        let details = UserDetails(map: userDict)
                        friends.append(details)
                    }
                    group.leave()
                })
            }
            group.notify(queue: queue) {
                onCompletion(friends)
            }
        })
    }
    
    func persistGenQuiz(genQuiz:GenQuizRound) {
        let ref = FIRDatabase.database().reference()
        if genQuiz.id == nil {
            let roundRef = ref.child("rounds").childByAutoId()
            genQuiz.id = roundRef.key
            let map = genQuiz.getPersistMap()
            roundRef.setValue(map)
        } else {
            let map = genQuiz.getPersistMap()
            ref.child("rounds").child(genQuiz.id!).setValue(map)
        }
        if genQuiz.toId != nil {
            if !genQuiz.toViewed {
                addGenQuizToUser(userId: genQuiz.toId!, genQuizId: genQuiz.id!)
            } else {
                removeGenQuizFromUser(userId: genQuiz.toId!, genQuizId: genQuiz.id!)
            }
        }
        if genQuiz.fromId != nil {
            if !genQuiz.fromViewed {
                addGenQuizToUser(userId: genQuiz.fromId!, genQuizId: genQuiz.id!)
            } else {
                removeGenQuizFromUser(userId: genQuiz.fromId!, genQuizId: genQuiz.id!)
            }
        }
    }
    
    func getGenQuizById(id:String, onCompletion:@escaping (GenQuizRound?)->Void) {
        let ref = FIRDatabase.database().reference().child("reounds/\(id)")
        ref.observeSingleEvent(of: .value, with: { snapshot in
            if snapshot.value != nil {
                let genQuiz = GenQuizRound(map: snapshot.value as! [String:Any?])
                onCompletion(genQuiz)
            } else {
                onCompletion(nil)
            }
        })
    }
    
    func addGenQuizToUser(userId:String, genQuizId:String) {
        let ref = FIRDatabase.database().reference().child("users/\(userId)/rounds/\(genQuizId)")
        ref.setValue(true)
    }
    
    func removeGenQuizFromUser(userId:String, genQuizId:String) {
        let ref = FIRDatabase.database().reference().child("users/\(userId)/rounds/\(genQuizId)")
        ref.removeValue()
    }
    
    func getRoundForUser(onCompletion: @escaping ([GenQuizRound])->Void) {
        let userId = FIRAuth.auth()?.currentUser?.uid
        getRoundsForUser(userId: userId!, onCompletion: onCompletion)
    }
    
    func getRoundsForUser(userId:String, onCompletion: @escaping ([GenQuizRound])->Void) {
        let ref = FIRDatabase.database().reference().child("users/\(userId)/rounds")
        ref.observeSingleEvent(of: .value, with: { snapshot in
            var rounds = [GenQuizRound]()
            let queue = DispatchQueue.global()
            let group = DispatchGroup()
            if snapshot.value != nil {
                let ids = snapshot.value as! [String]
                for id in ids {
                    group.enter()
                    self.getGenQuizById(id: id, onCompletion: {round in
                        if round != nil {
                            rounds.append(round!)
                        } else {
                            self.removeGenQuizFromUser(userId: userId, genQuizId: id)
                        }
                        group.leave()
                    })
                }
            }
            group.notify(queue: queue) {
                onCompletion(rounds)
            }
        })
    }
}

class UserDetails {
    var id:String!
    var highScore:Int?
    var numberOfRounds:Int?
    var hasFamilyTree:Bool!
    var name:String!
    var photoUrl:String?
    var lastLogin:Date?
    
    init(map:[String:Any?]) {
        self.id = map["id"] as! String
        self.highScore = map["highScore"] as? Int
        self.numberOfRounds = map["numberOfRounds"] as? Int
        self.hasFamilyTree = map["hasFamilyTree"] as! Bool
        self.name = map["name"] as! String
        self.photoUrl = map["photoUrl"] as? String
        if map["lastLogin"] != nil {
            self.lastLogin = Date(timeIntervalSince1970: map["lastLogin"] as! TimeInterval)
        }
    }
    
    func toPersist() -> [String:Any?] {
        var map = [String:Any?]()
        map["id"] = self.id
        map["numberOfRounds"] = self.numberOfRounds
        map["highScore"] = self.highScore
        map["hasFamilyTree"] = self.hasFamilyTree
        map["name"] = self.name
        map["photoUrl"] = self.photoUrl
        
        return map
    }
}
