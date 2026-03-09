/* ─────────────────────────────────────────
   VIDHI — Legislative AI Dashboard
   js/samples.js  —  Sample Bill Data
───────────────────────────────────────── */

const SAMPLES = {
  dpdp: {
    title: 'DPDP Act, 2023',
    text: `THE DIGITAL PERSONAL DATA PROTECTION ACT, 2023
An Act to provide for the processing of digital personal data in a manner that recognises both the right of individuals to protect their personal data and the need to process such personal data for lawful purposes and for matters connected therewith or incidental thereto.

CHAPTER I — PRELIMINARY
1. Short title, extent, commencement and application.—(1) This Act may be called the Digital Personal Data Protection Act, 2023.
(2) It extends to the whole of India and also applies to the processing of digital personal data outside the territory of India, if such processing is in connection with any activity related to offering of goods or services to Data Principals within the territory of India.

CHAPTER II — OBLIGATIONS OF DATA FIDUCIARY
4. Grounds for processing personal data.—(1) A person may process the personal data of a Data Principal only in accordance with the provisions of this Act and for a lawful purpose—
(a) for which the Data Principal has given her consent; or
(b) for certain legitimate uses specified in this Act.

5. Notice.—(1) Every Data Fiduciary shall give to each Data Principal, before or at the time of seeking consent, a notice—
(a) describing the personal data sought and the purpose of processing such personal data;
(b) the manner in which the Data Principal may exercise the rights under the provisions of this Act; and
(c) the manner in which the Data Principal may make a complaint to the Board.

CHAPTER III — RIGHTS AND DUTIES OF DATA PRINCIPAL
11. Right to information about personal data.—(1) A Data Principal shall have the right to obtain from the Data Fiduciary—
(a) a summary of personal data being processed by the Data Fiduciary and the processing activities undertaken;
(b) the identities of all the Data Fiduciaries with whom the personal data has been shared by the Data Fiduciary.

12. Right to correction and erasure.—(1) A Data Principal shall have the right to—
(a) correction of inaccurate or misleading personal data;
(b) completion of incomplete personal data;
(c) updating of personal data;
(d) erasure of personal data, the retention of which is not necessary for the purpose for which such data was collected.

PENALTIES
Section 25 establishes the Data Protection Board of India with powers to impose penalties of up to Rs. 250 crore per breach for failure to take reasonable security safeguards. Penalties up to Rs. 200 crore for failure to notify the Board and affected Data Principals of personal data breaches. Penalties up to Rs. 10,000 for breach of duty by Data Principal.`,
  },

  gst: {
    title: 'GST Amendment Bill',
    text: `THE GOODS AND SERVICES TAX (AMENDMENT) BILL, 2023
A Bill to amend the Central Goods and Services Tax Act, 2017, the Integrated Goods and Services Tax Act, 2017, and the Union Territory Goods and Services Tax Act, 2017.

STATEMENT OF OBJECTS AND REASONS
The Goods and Services Tax Council in its meetings held during 2022-23 has recommended various amendments to the Central Goods and Services Tax Act, 2017. The proposed amendments seek to curb evasion, rationalize tax rates and procedures, introduce Input Service Distributors, penalize fake invoicing, and expand the definition of online gaming to levy 28% GST on all online gaming platforms without distinction between games of skill or chance.

KEY PROVISIONS:
Section 2 — Online gaming platforms including fantasy sports shall attract 28% GST on the full face value of bets/deposits, not merely the platform fee. This replaces the earlier 18% on platform fees for skill-based games.

Section 7 — The scope of supply is amended to include actionable claims in online gaming, casinos and horse racing.

Section 13 — Input Service Distributor provisions expanded. The ISD mechanism is now mandatory for entities having multiple GST registrations receiving common input services.

PENALTIES AND ENFORCEMENT:
Enhanced penalties for fake invoice generation. Insertion of new section for provisional attachment of property to protect government revenue. GST officers given power to arrest without warrant in cases of tax evasion exceeding Rs. 2 crore.`,
  },

  agri: {
    title: 'Farm Laws Overview',
    text: `THE FARMERS' PRODUCE TRADE AND COMMERCE (PROMOTION AND FACILITATION) ACT, 2020
An Act to provide for the creation of an ecosystem where the farmers and traders enjoy the freedom of choice relating to sale and purchase of farmers' produce which facilitates remunerative prices through competitive alternative trading channels to promote efficient, transparent and barrier-free inter-State and intra-State trade including electronic trading.

KEY PROVISIONS:
Section 3 — Trade and commerce in farmers' produce: Any farmer, trader or electronic trading and transaction platform may engage in the trade of agricultural produce in a trade area. No tax shall be levied on any farmer or trader for the trade of farmers' produce under this Act.

Section 4 — Any trader purchasing the farmers' produce shall pay to the farmer, the agreed upon price for such farmers' produce on the same day or within the maximum period of three working days.

Section 6 — Dispute resolution: Any dispute arising between a farmer and a trader shall be referred for conciliation to the Sub-Divisional Magistrate having jurisdiction over the area of such trade.

CONCERNS RAISED:
Critics argued these laws would dismantle the APMC mandi system, deprive farmers of MSP protection, and expose them to exploitation by large corporations. The laws were ultimately repealed in November 2021 following sustained protests by farmer unions primarily from Punjab, Haryana, and Uttar Pradesh. The government announced it would repeal the laws through ordinance before the Winter Session of Parliament.`,
  },

  it: {
    title: 'IT Rules 2021',
    text: `THE INFORMATION TECHNOLOGY (INTERMEDIARY GUIDELINES AND DIGITAL MEDIA ETHICS CODE) RULES, 2021
In exercise of the powers conferred by sub-section (1) and clauses (z) and (zg) of sub-section (2) of section 87, read with section 79 of the Information Technology Act, 2000.

PART I — GENERAL
Rule 2 — Definitions: 'Significant social media intermediary' means a social media intermediary having number of registered users in India above such threshold as may be notified by the Central Government. Currently set at 50 lakh (5 million) registered users.

PART II — DUE DILIGENCE BY INTERMEDIARIES AND GRIEVANCE REDRESSAL
Rule 4 — Additional due diligence by significant social media intermediaries:
(a) Appoint a Chief Compliance Officer, a Nodal Contact Person, and a Resident Grievance Officer, all of whom must be residents in India.
(b) Publish monthly compliance reports detailing complaints received and action taken.
(c) Enable identification of the first originator of information on its platform when required by court order or government direction.
(d) Automated tools or mechanisms for proactive identification of content depicting rape, child sexual abuse material or information related to a Court order.

PART III — CODE OF ETHICS AND PROCEDURE FOR DIGITAL MEDIA
Digital news publishers and OTT platforms must follow a Code of Ethics, register with Ministry of Information and Broadcasting, and comply with a three-tier grievance redressal mechanism.

CONTROVERSY:
The traceability requirement (first originator identification) has been criticized by WhatsApp and digital rights groups as fundamentally incompatible with end-to-end encryption and as a threat to privacy. WhatsApp filed a petition in the Delhi High Court challenging this rule.`,
  },
};

function loadSample(key) {
  const s = SAMPLES[key];
  if (!s) return;
  const ta = document.getElementById('docText');
  ta.value = s.text;
  ta.dispatchEvent(new Event('input'));
}
