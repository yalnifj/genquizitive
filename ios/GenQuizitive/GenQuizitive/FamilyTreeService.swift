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
    var usedPeople:[String:Bool] = [String:Bool]()
    
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
        
        remoteService!.getCurrentPerson(onCompletion)
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
                })
                //-- get spouses?
            }
            else {
                onCompletion(nil, err)
            }
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
    
    func getPersonPortrait(personId:String, onCompletion: @escaping (String?)->Void) {
        if self.portraits[personId] != nil {
            onCompletion(self.portraits[personId]!)
        } else {
            self.remoteService!.getPersonPortrait(personId, onCompletion: {link, err in
                if link != nil && link!.href != nil {
                    self.remoteService!.downloadImage(link!.href!, folderName: "portraits", fileName: personId, onCompletion: { path, err2 in
                        if path == nil {
                            self.portraits[personId] = ""
                            onCompletion("")
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
    
    @objc func processBackgroundTimer() {
        if self.backgroundQ.count > 0 {
            let meth = self.backgroundQ.removeFirst()
            meth()
        }
    }
}
