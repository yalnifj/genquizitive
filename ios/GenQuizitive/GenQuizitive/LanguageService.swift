//
//  LanguageService.swift
//  GenQuizitive
//
//  Created by Bryan  Farnworth on 3/2/17.
//  Copyright © 2017 Yellow Fork Technologies. All rights reserved.
//

import Foundation

class LanguageService {
    static var instance:LanguageService?
    private init() {
        
    }
    static func getInstance() -> LanguageService {
        if instance == nil {
            instance = LanguageService()
        }
        return instance!
    }
    
    class LangFact {
        var pastVerb:String?
        var label:String?
        var family = false
        var order:Int!
        init(pastVerb:String?, order:Int) {
            self.pastVerb = pastVerb
            self.label = nil
            self.order = order
        }
        init(pastVerb:String?, family: Bool, order:Int) {
            self.pastVerb = pastVerb
            self.family = family
            self.order = order
        }
        init(pastVerb:String?, label:String?, order:Int) {
            self.pastVerb = pastVerb
            self.label = label
            self.order = order
        }
        init(order: Int) {
            self.pastVerb = nil
            self.label = nil
            self.order = order
        }
    }
    
    var facts:[String:LangFact] = [
        "http://gedcomx.org/Adoption": LangFact( pastVerb: "was adopted", label: nil, order: 1 ),
        "http://gedcomx.org/AdultChristening": LangFact( pastVerb: "was christened as an adult", label: "Adult Christening", order: 5 ),
        "http://gedcomx.org/Amnesty": LangFact( pastVerb: "was given amnesty", order: 5 ),
        "http://gedcomx.org/Apprenticeship": LangFact( pastVerb: "served an apprenticeship", order: 4 ),
        "http://gedcomx.org/Arrest": LangFact( pastVerb: "was arrested", order: 5 ),
        "http://gedcomx.org/Baptism": LangFact( pastVerb: "was baptized", order: 4 ),
        "http://gedcomx.org/BarMitzvah": LangFact( pastVerb: "had a Bar Mitzvah", order: 4 ),
        "http://gedcomx.org/BatMitzvah": LangFact( pastVerb: "had a Bat Mitzvah", order: 4 ),
        "http://gedcomx.org/Birth": LangFact( pastVerb: "was born", order: 0 ),
        "http://gedcomx.org/Blessing": LangFact( pastVerb: "was blessed", order: 1 ),
        "http://gedcomx.org/Burial": LangFact( pastVerb: "was buried", order: 10 ),
        "http://gedcomx.org/Caste": LangFact( order: 5 ),
        "http://gedcomx.org/Census": LangFact( pastVerb: "was recorded in a census", order: 5 ),
        "data:,census": LangFact( pastVerb: "was recorded in a census", label: "Census", order: 5 ),
        "http://gedcomx.org/Christening": LangFact( pastVerb: "was christened", order: 1 ),
        "http://gedcomx.org/Circumcision": LangFact( pastVerb: "was circumcized", order: 1 ),
        "http://gedcomx.org/Clan": LangFact( order: 5 ),
        "http://gedcomx.org/Confirmation": LangFact( pastVerb: "had a confirmation", order:4 ),
        "http://gedcomx.org/Cremation": LangFact( pastVerb: "was cremated", order: 11 ),
        "http://gedcomx.org/Court": LangFact( pastVerb: "appeared in court", order: 5 ),
        "http://gedcomx.org/Death": LangFact( pastVerb: "died", order: 8 ),
        "http://gedcomx.org/Education": LangFact( pastVerb: "was educated", order: 5 ),
        "http://gedcomx.org/EducationEnrollment": LangFact( pastVerb: "enrolled in an education", label: "Education Enrollment", order: 4 ),
        "http://gedcomx.org/Emigration": LangFact( pastVerb: "emigrated", order: 5 ),
        "http://gedcomx.org/Ethnicity": LangFact( order: 5 ),
        "http://gedcomx.org/Excommunication": LangFact( pastVerb: "was excommunicated", order: 5 ),
        "http://gedcomx.org/FirstCommunion": LangFact( pastVerb: "had first communion", order: 2 ),
        "http://gedcomx.org/Funeral": LangFact( pastVerb: "had a funeral", order: 9 ),
        "http://gedcomx.org/GenderChange": LangFact( pastVerb: "changed genders", order: 5 ),
        "http://gedcomx.org/Graduation": LangFact( pastVerb: "graduated", order: 6 ),
        "http://gedcomx.org/Immigration": LangFact( pastVerb: "immigrated", order: 5 ),
        "http://gedcomx.org/Imprisonment": LangFact( pastVerb: "was imprisoned", order: 5 ),
        "http://gedcomx.org/Inquest": LangFact(order: 5 ),
        "http://gedcomx.org/LandTransaction": LangFact( pastVerb: nil, label: "Land Transaction", order: 6),
        "http://gedcomx.org/Language": LangFact( order: 5 ),
        "http://gedcomx.org/Living": LangFact( order: 5 ),
        "http://gedcomx.org/MaritalStatus": LangFact( pastVerb: nil, label: "Marital Status", order: 5 ),
        "http://gedcomx.org/Medical": LangFact( order: 5 ),
        "http://gedcomx.org/MilitaryAward": LangFact( pastVerb: "received a military award", label: "Military Award", order: 5 ),
        "http://gedcomx.org/MilitaryDischarge": LangFact( pastVerb: "was discharged from the military", label: "Military Discharge", order: 5 ),
        "http://gedcomx.org/MilitaryDraftRegistration": LangFact( pastVerb: "was drafted into the military", label: "Military Draft Registration", order: 5 ),
        "http://gedcomx.org/MilitaryInduction": LangFact( pastVerb: nil, label: "Military Induction", order: 5 ),
        "http://gedcomx.org/MilitaryService": LangFact( pastVerb: nil, label: "Military Service", order: 5 ),
        "http://gedcomx.org/Mission": LangFact( pastVerb: "served a mission", order: 5 ),
        "http://gedcomx.org/MoveFrom": LangFact( pastVerb: "moved from", label: "Moved from", order: 5 ),
        "http://gedcomx.org/MoveTo": LangFact( pastVerb: "moved to", label: "Moved to", order: 5 ),
        "http://gedcomx.org/MultipleBirth": LangFact( pastVerb: nil, label: "Multiple Birth", order: 5 ),
        "http://gedcomx.org/NationalId": LangFact( pastVerb: nil, label: "National ID", order: 5 ),
        "http://gedcomx.org/Nationality": LangFact( order: 5 ),
        "http://gedcomx.org/Naturalization": LangFact( pastVerb: "was naturalized", order: 5 ),
        "http://gedcomx.org/NumberOfMarriages": LangFact( pastVerb: nil, label: "Number of Marriages", order: 5 ),
        "http://gedcomx.org/Obituary": LangFact( pastVerb: "appeared in an obituary", order: 10 ),
        "http://gedcomx.org/Occupation": LangFact( pastVerb: "worked as", order: 5),
        "http://gedcomx.org/Ordination": LangFact( pastVerb: "was ordained", order: 5 ),
        "http://gedcomx.org/Pardon": LangFact( pastVerb: "was pardoned", order: 6 ),
        "http://gedcomx.org/PhysicalDescription": LangFact( pastVerb: nil, label: "Physical Description", order: 5 ),
        "http://gedcomx.org/Probate": LangFact( order: 5 ),
        "http://gedcomx.org/Property": LangFact( order: 6 ),
        "http://gedcomx.org/Religion": LangFact( pastVerb: "was a", order: 5 ),
        "http://gedcomx.org/Residence": LangFact( pastVerb: "resided", order: 5 ),
        "http://gedcomx.org/Retirement": LangFact( pastVerb: "retired", order: 7 ),
        "http://gedcomx.org/Stillbirth": LangFact( pastVerb: nil, label: "Still Birth", order: 0 ),
        "http://gedcomx.org/TaxAssessment": LangFact( pastVerb: nil, label: "Tax Assessment", order: 5 ),
        "http://gedcomx.org/Will": LangFact( order: 7 ),
        "http://gedcomx.org/Visit": LangFact( order: 5 ),
        "http://gedcomx.org/Yahrzeit": LangFact( order: 11 ),
        "http://gedcomx.org/Annulment": LangFact( order: 5 ),
        "http://gedcomx.org/CommonLawMarriage": LangFact( pastVerb: nil, label: "Common-law Marriage", order: 5 ),
        "http://gedcomx.org/CivilUnion": LangFact( pastVerb: "entered a civil union", label: "Civil Union", order: 5 ),
        "http://gedcomx.org/Divorce": LangFact( pastVerb: "was divorced", family: true, order: 6 ),
        "http://gedcomx.org/DivorceFiling": LangFact( pastVerb: nil, label: "Divorce Filing", order: 6 ),
        "http://gedcomx.org/DomesticPartnership": LangFact( pastVerb: "was in a domestic partnership", label: "Domestic Partnership", order: 5 ),
        "http://gedcomx.org/Engagement": LangFact( pastVerb: "was engaged", family: true, order: 4 ),
        "http://gedcomx.org/Marriage": LangFact( pastVerb: "was married", family: true, order: 5 ),
        "http://gedcomx.org/MarriageBanns": LangFact( pastVerb: nil, label: "Marriage Banns", order: 5),
        "http://gedcomx.org/MarriageContract": LangFact( pastVerb: nil, label: "Marriage Contract", order: 4 ),
        "http://gedcomx.org/MarriageLicense": LangFact( pastVerb: nil, label: "Marriage License", order: 4 ),
        "http://gedcomx.org/MarriageNotice": LangFact( pastVerb: nil, label: "Marriage Notice", order: 6),
        "http://gedcomx.org/NumberOfChildren": LangFact( pastVerb: nil, label: "Number Of Children", order: 6 ),
        "http://gedcomx.org/Separation": LangFact( pastVerb: "was separated", family: true, order: 6 ),
        "http://familysearch.org/v1/TribeName": LangFact( pastVerb: nil, label: "Tribe", order: 6 )
    ]
    
    func getDateYear(date:String) -> String {
        let regexp = "/\\d\\d\\d\\d/"
        if let range = date.range(of:regexp, options: .regularExpression) {
            let result = date.substring(with:range)
            return result
        }
        return ""
    };
}
