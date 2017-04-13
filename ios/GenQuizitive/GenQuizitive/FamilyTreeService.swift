//
//  FamilyTreeService.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 2/18/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation

class FamilyTreeService {
    var remoteService:RemoteService?
    
    static var instance:FamilyTreeService?
    
    private init() {
        backgroundTimer = Timer.scheduledTimer(timeInterval: 2, target: self, selector: #selector(processBackgroundTimer), userInfo: nil, repeats: true)
    }
    
    static func getInstance() -> FamilyTreeService {
        if instance == nil {
            instance = FamilyTreeService()
        }
        return instance!
    }
    
    var people:[String:Person] = [String:Person]()
    var portraits:[String:String] = [String:String]()
    var checkedPortraits:[String:Bool] = [String:Bool]()
    var usedPeople:[String:Bool] = [String:Bool]()
    
    var difficultyLevels = [8, 16, 32, 64, 128]
    
    var fsUser:Person?
    
    var backgroundTimer: Timer!
    var backgroundQ = [()->Void]()

    func getCurrentPerson(onCompletion: @escaping PersonResponse) {
        if self.fsUser != nil {
            onCompletion(self.fsUser, nil);
            return
        }
        
        if remoteService == nil {
            onCompletion(nil, NSError(domain: "FamilyTreeService", code: 401, userInfo: ["message":"RemoteService Required"]))
            return
        }
        
        remoteService!.getCurrentPerson({person, err  in
            if person != nil {
                self.fsUser = person
            }
            onCompletion(person, err)
        })
    }
    
    func loadInitialData(onCompletion: @escaping PersonResponse) {
        self.getCurrentPerson(onCompletion: {person, err in
            if person != nil {
                self.people[person!.id!] = person
                self.usedPeople[person!.id!] = true
                self.getPersonPortrait(personId: person!.id!, onCompletion: {path in })
                self.getAncestorTree(personId: person!.id!, generations: 8, details: true, spouse: nil, noCache: false, onCompletion: {people, err in
                    if people != nil {
                        var count = 0
                        for p in people!.reversed() {
                            if count < people!.count / 2 {
                                self.backgroundQ.append({()->Void in
                                    self.getDescendancyTree(personId: p.id!, generations: 2, details: true, spouse: nil, noCache: false, onCompletion: {desc, err in
                                        
                                    })
                                })
                            }
                            count += 1
                        }
                    }
                    //-- try to load spouse trees if there are not many people
                    if self.people.count < 40 {
                        self.getSpouses(personId: person!.id!, onCompletion: {spouses, err in
                            if spouses != nil {
                                for spouse in spouses! {
                                    self.usedPeople[spouse.id!] = true
                                    self.getAncestorTree(personId: spouse.id!, generations: 8, details: true, spouse: nil, noCache: false, onCompletion: {speople, err in
                                        //-- nothing to do now
                                    })
                                }
                            }
                        })
                    }
                    print("Loaded \(self.people.count) people so far.")
                    onCompletion(person!, nil)
                })
            }
            else {
                onCompletion(nil, err)
            }
        })
    }
    
    func getPerson(personId:String, onCompletion: @escaping PersonResponse) {
        if people[personId] != nil {
            onCompletion(people[personId], nil);
            return
        }
        
        if remoteService == nil {
            onCompletion(nil, NSError(domain: "FamilyTreeService", code: 401, userInfo: ["message":"RemoteService Required"]))
            return
        }
        
        remoteService!.getPerson(personId, ignoreCache: false, onCompletion: {person, err in
            if person != nil {
                self.people[personId] = person!
                self.backgroundQ.append({()->Void in
                    self.getPersonPortrait(personId: person!.id!, onCompletion: {path in })
                })
            }
            onCompletion(person, err)
        })
    }
    
    func getAncestorTree(personId: String, generations: Int, details:Bool, spouse:String?, noCache:Bool, onCompletion: @escaping ([Person]?, NSError?) -> Void) {
        if remoteService == nil {
            onCompletion(nil, NSError(domain: "FamilyTreeService", code: 401, userInfo: ["message":"RemoteService Required"]))
            return
        }
        
        self.remoteService!.getAncestorTree(personId: personId, generations: generations, details: details, spouse: spouse, noCache: noCache, onCompletion: {people, err in
            if people != nil {
                if details && !noCache {
                    for person in people! {
                        self.people[person.id!] = person
                        self.backgroundQ.append({()->Void in
                            self.getPersonPortrait(personId: person.id!, onCompletion: {path in })
                        })
                    }
                }
                onCompletion(people, err)
            } else {
                onCompletion(people, err)
            }
        })
    }
    
    func getDescendancyTree(personId: String, generations: Int, details:Bool, spouse:String?, noCache:Bool, onCompletion: @escaping ([Person]?, NSError?) -> Void) {
        if remoteService == nil {
            onCompletion(nil, NSError(domain: "FamilyTreeService", code: 401, userInfo: ["message":"RemoteService Required"]))
            return
        }
        
        self.remoteService!.getDescendancyTree(personId: personId, generations: generations, details: details, spouse: spouse, noCache: noCache, onCompletion: {people, err in
            if people != nil {
                if details && !noCache {
                    for person in people! {
                        self.people[person.id!] = person
                        self.backgroundQ.append({()->Void in
                            self.getPersonPortrait(personId: person.id!, onCompletion: {path in })
                        })
                    }
                }
                onCompletion(people, err)
            } else {
                onCompletion(people, err)
            }
        })
    }
    
    func getSpouses(personId:String, onCompletion: @escaping ([Person]?, NSError?)->Void) {
        if remoteService == nil {
            onCompletion(nil, NSError(domain: "FamilyTreeService", code: 401, userInfo: ["message":"RemoteService Required"]))
            return
        }
        
        self.remoteService!.getSpouses(personId, onCompletion: {relationships, err in
            if relationships != nil {
                let queue = DispatchQueue.global()
                let group = DispatchGroup()
                
                var spouses = [Person]()
                for rel in relationships! {
                    if rel.person1 != nil && rel.person1!.resourceId != nil && rel.person1!.resourceId != personId {
                        group.enter()
                        self.remoteService!.getPerson(rel.person1!.resourceId!, ignoreCache: false, onCompletion: {person, err in
                            if person != nil {
                                self.people[person!.id!] = person
                                self.backgroundQ.append({()->Void in
                                    self.getPersonPortrait(personId: person!.id!, onCompletion: {path in })
                                })
                                spouses.append(person!)
                            }
                            group.leave()
                        })
                    }
                    else if rel.person2 != nil && rel.person2!.resourceId != nil && rel.person2!.resourceId != personId {
                        group.enter()
                        self.remoteService!.getPerson(rel.person2!.resourceId!, ignoreCache: false, onCompletion: {person, err in
                            if person != nil {
                                self.people[person!.id!] = person
                                self.backgroundQ.append({()->Void in
                                    self.getPersonPortrait(personId: person!.id!, onCompletion: {path in })
                                })
                                spouses.append(person!)
                            }
                            group.leave()
                        })
                    }
                }
                
                group.notify(queue: queue) {
                    onCompletion(spouses, nil)
                }
            } else {
                onCompletion(nil, err)
            }
        })
    }
    
    func getParents(personId:String, onCompletion: @escaping ([Person]?, NSError?)->Void) {
        if remoteService == nil {
            onCompletion(nil, NSError(domain: "FamilyTreeService", code: 401, userInfo: ["message":"RemoteService Required"]))
            return
        }
        
        self.remoteService!.getParents(personId, onCompletion: {relationships, err in
            if relationships != nil {
                let queue = DispatchQueue.global()
                let group = DispatchGroup()
                
                var parents = [Person]()
                for rel in relationships! {
                    if rel.type == Relationship.REL_TYPE_PARENTCHILD {
                        if rel.person1 != nil && rel.person1!.resourceId != nil && rel.person1!.resourceId != personId {
                            group.enter()
                            self.remoteService!.getPerson(rel.person1!.resourceId!, ignoreCache: false, onCompletion: {person, err in
                                if person != nil {
                                    self.people[person!.id!] = person
                                    self.backgroundQ.append({()->Void in
                                        self.getPersonPortrait(personId: person!.id!, onCompletion: {path in })
                                    })
                                    parents.append(person!)
                                }
                                group.leave()
                            })
                        }
                        else if rel.person2 != nil && rel.person2!.resourceId != nil && rel.person2!.resourceId != personId {
                            group.enter()
                            self.remoteService!.getPerson(rel.person2!.resourceId!, ignoreCache: false, onCompletion: {person, err in
                                if person != nil {
                                    self.people[person!.id!] = person
                                    self.backgroundQ.append({()->Void in
                                        self.getPersonPortrait(personId: person!.id!, onCompletion: {path in })
                                    })
                                    parents.append(person!)
                                }
                                group.leave()
                            })
                        }
                    }
                }
                
                group.notify(queue: queue) {
                    onCompletion(parents, nil)
                }
            } else {
                onCompletion(nil, err)
            }
        })
    }
    
    func getChildren(personId:String, onCompletion: @escaping ([Person]?, NSError?)->Void) {
        if remoteService == nil {
            onCompletion(nil, NSError(domain: "FamilyTreeService", code: 401, userInfo: ["message":"RemoteService Required"]))
            return
        }
        
        self.remoteService!.getChildren(personId, onCompletion: {relationships, err in
            if relationships != nil {
                let queue = DispatchQueue.global()
                let group = DispatchGroup()
                
                var children = [Person]()
                for rel in relationships! {
                    if rel.person1 != nil && rel.person1!.resourceId != nil && rel.person1!.resourceId != personId {
                        group.enter()
                        self.remoteService!.getPerson(rel.person1!.resourceId!, ignoreCache: false, onCompletion: {person, err in
                            if person != nil {
                                self.people[person!.id!] = person
                                self.backgroundQ.append({()->Void in
                                    self.getPersonPortrait(personId: person!.id!, onCompletion: {path in })
                                })
                                children.append(person!)
                            }
                            group.leave()
                        })
                    }
                    else if rel.person2 != nil && rel.person2!.resourceId != nil && rel.person2!.resourceId != personId {
                        group.enter()
                        self.remoteService!.getPerson(rel.person2!.resourceId!, ignoreCache: false, onCompletion: {person, err in
                            if person != nil {
                                self.people[person!.id!] = person
                                self.backgroundQ.append({()->Void in
                                    self.getPersonPortrait(personId: person!.id!, onCompletion: {path in })
                                })
                                children.append(person!)
                            }
                            group.leave()
                        })
                    }
                }
                
                group.notify(queue: queue) {
                    onCompletion(children, nil)
                }
            } else {
                onCompletion(nil, err)
            }
        })
    }
    
    func getPersonPortrait(personId:String, onCompletion: @escaping (String?)->Void) {
        if self.portraits[personId] != nil {
            onCompletion(self.portraits[personId]!)
        } else if self.checkedPortraits[personId] != nil {
            onCompletion(nil)
        } else {
            self.remoteService!.getPersonPortrait(personId, onCompletion: {link, err in
                if link != nil && link!.href != nil {
                    self.remoteService!.downloadImage(link!.href!, folderName: "portraits", fileName: personId, onCompletion: { path, err2 in
                        if path == nil {
                            self.checkedPortraits[personId] = true
                            onCompletion(nil)
                        } else {
                            self.portraits[personId] = path
                            onCompletion(path)
                        }
                    })
                } else {
                    if err != nil {
                        print(err!.description)
                    }
                    onCompletion(nil)
                }
            })
        }
    }
    
    func getRandomPerson(useLiving:Bool, difficulty:Int)->Person? {
        let peopleIds = Array(self.people.keys)
        
        var max = peopleIds.count
        if (difficulty < 5) {
            if max > self.difficultyLevels[difficulty] {
                max = self.difficultyLevels[difficulty]
            }
        }
        
        var person:Person? = nil
        var count = 0
        while count < 5 && person == nil {
            let r = Int(arc4random_uniform(UInt32(max)))
            let randomId = peopleIds[r]
            if self.usedPeople[randomId] == nil {
                person = self.people[randomId]
                if person != nil && !useLiving && person!.living {
                    person = nil
                }
            }
            count += 1
        }
        
        return person
    }
    
    func getRandomPersonWithPortrait(useLiving:Bool, difficulty:Int, onCompletion: @escaping PersonResponse) {
        if self.portraits.count > 1 {
            var peopleIds = Array(self.portraits.keys)
            var max = peopleIds.count
            if (difficulty < 5) {
                if max > self.difficultyLevels[difficulty] {
                    max = self.difficultyLevels[difficulty]
                }
            }
            var person:Person? = nil
            var count = 0
            while count < 5 && person == nil {
                let r = Int(arc4random_uniform(UInt32(max)))
                let randomId = peopleIds[r]
                if self.usedPeople[randomId] == nil {
                    person = self.people[randomId]
                    if person != nil && !useLiving && person!.living! {
                        person = nil
                    }
                }
                count += 1
            }
            
            if person != nil {
                onCompletion(person, nil)
                return
            }
        }
        
        if self.people.count > 1 {
            var peopleIds = Array(self.people.keys)
            var max = peopleIds.count
            if (difficulty < 5) {
                if max > self.difficultyLevels[difficulty] {
                    max = self.difficultyLevels[difficulty]
                }
            }
            var person:Person? = nil
            var count = 0
            while count < 5 && person == nil {
                let r = Int(arc4random_uniform(UInt32(max)))
                var randomId = peopleIds[r]
                if self.usedPeople[randomId] == nil && self.checkedPortraits[randomId] == nil {
                    person = self.people[randomId]
                    if person != nil && !useLiving && person!.living! {
                        person = nil
                    }
                }
                count += 1
            }
            
            if person != nil {
                self.getPersonPortrait(personId: person!.id!, onCompletion: {path in
                    if path != nil {
                        onCompletion(person, nil)
                    } else {
                        onCompletion(nil, NSError(domain: "FamilyTreeService", code: 404, userInfo: ["message":"Unable to find a random portrait"]))
                    }
                })
            } else {
                onCompletion(nil, NSError(domain: "FamilyTreeService", code: 405, userInfo: ["message":"Not enough unused people"]))
            }
        }
    }
    
    func getRandomPeopleNear(person:Person, num:Int, useLiving:Bool, ignoreGender:Bool, onCompletion: @escaping ([Person]?, NSError?)->Void) {
        
        self.remoteService!.getCloseRelatives(person.id!, onCompletion: {relationships, err in
            var people = [String:Person]()
            if relationships != nil {
                var max = num
                if max <= 0 {
                    max = relationships!.count
                }
                if max > relationships!.count {
                    max = relationships!.count
                }
                var r = Int(arc4random_uniform(UInt32(relationships!.count)))
                var count = 0
                while count < max {
                    let rel = relationships![r]
                    
                    if rel.person1 != nil && rel.person1!.resourceId != nil && rel.person1!.resourceId! != person.id! {
                        let rperson:Person? = self.people[rel.person1!.resourceId!]
                        if rperson != nil && (!useLiving || !rperson!.living!) {
                            if ignoreGender || rperson!.gender != person.gender {
                                people[rperson!.id!] = rperson!
                            }
                        }
                    }
                    
                    r += 1
                    if r >= relationships!.count {
                        r = 0
                    }
                    count += 1
                }
                
                while people.count < max && count < num * 4 {
                    var rPerson = self.getRandomPerson(useLiving: useLiving, difficulty: 4)
                    if rPerson != nil && people[rPerson!.id!] == nil && (ignoreGender || rPerson!.gender != person.gender) {
                        people[rPerson!.id!] = rPerson!
                    }
                    count += 1
                }
                
                onCompletion(Array(people.values), nil)
            } else {
                var count = 0
                var max = num
                while people.count < max && count < num * 4 {
                    var rPerson = self.getRandomPerson(useLiving: useLiving, difficulty: 4)
                    if rPerson != nil && people[rPerson!.id!] == nil && (ignoreGender || rPerson!.gender != person.gender) {
                        people[rPerson!.id!] = rPerson!
                    }
                    count += 1
                }
                
                onCompletion(Array(people.values), err)
            }
        })
    }
    
    func markUsed(personId:String) {
        self.usedPeople[personId] = true
    }
    
    func clearUsed() {
        self.usedPeople.removeAll()
    }
    
    @objc func processBackgroundTimer() {
        if self.backgroundQ.count > 0 {
            let meth = self.backgroundQ.removeFirst()
            meth()
        }
    }
}
