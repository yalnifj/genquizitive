//
//  RelationshipService.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 3/4/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation

class RelationshipService {
    static var instance:RelationshipService?
    static func getInstance() -> RelationshipService {
        if instance == nil {
            instance = RelationshipService()
        }
        return instance!
    }
    private init() {
        
    }
    
    func getRandomRelationshipPath(person:Person, length:Int, useLiving:Bool) -> [Relationship] {
        var path = [Relationship]()
        var currentPerson = person
        var lastRel:Relationship? = nil
        while path.count < length {
            let queue = DispatchQueue.global()
            let group = DispatchGroup()
            var rand = Int(arc4random_uniform(4))
            
            if rand < 2 || (!useLiving && currentPerson.living) {
                //-- parent path
            } else if rand == 2 {
                //-- child path
            } else {
                //-- spouse path
            }
            
            group.notify(queue: queue) {
                
            }
        }
        return path
    }
}
