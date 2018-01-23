
import React from 'react'
import { Link } from 'react-router'
import _ from 'lodash'
import Form from 'react-router-form'

import ArbitraryHTMLComp from "../components/ArbitraryHTMLComp.jsx"
import MetaTagsComp from '../components/MetaTagsComp.jsx'
import PageBase from './PageBase.jsx'

const ymToString = ym =>
  ym.toString().substr(0,4) + "-" + ym.toString().substr(4,2)

const formatNum = n =>
  n && n.toLocaleString()

const describeChildren = childTypes => {
  let out = []
  _.each(childTypes, (count, type) =>
    out.push(count.toString() + " " + type + (count==1 || type.endsWith("ies") ? "" : type.endsWith("s") ? "es" : "s")))
  return out.join(", ")
}

class StatsHeader extends React.Component {
  render() {
    let p = this.props
    return(
      <div>
        <MetaTagsComp title={`${p.title}: ${p.data.unit_name}`}/>
        <h1><Link to={`/uc/${p.params.unitID}/stats`}>{p.data.unit_name}</Link></h1>
        { p.data.parent_unit_id &&
          <p>
            Parent: <Link to={`/uc/${p.data.parent_unit_id}/stats/${p.params.pageName}${p.location.search}`}>
              {p.data.parent_unit_name}
            </Link>
          </p>
        }
        <h2>Stats: {p.title}</h2>
      </div>
    )
  }
}

class StatsForm extends React.Component {
  render = () =>
    <Form to={this.props.location.pathname} method="GET">
      {this.props.names.map(name =>
        (name == "st_yr" || name == "st_mo" || name == "en_yr" || name == "en_mo") ?
          <span key={name}>
            <label htmlFor="st_yr">{name.replace("st_", "Start ").
                                         replace("en_", "End ").
                                         replace("yr", "year").
                                         replace("mo", "month")}</label>
            <select id={name} name={name} defaultValue={this.props.data[name]}>
              {((name == "st_yr" || name == "en_yr") ? this.props.data.year_range : _.range(1,13)).map(val =>
                <option key={val} value={val}>{val}</option>
              )}
            </select>
          </span> :
        (name == "limit") ?
          <span key={name}>
            <label htmlFor="limit">Max items:</label>
            <select id="limit" name="limit" defaultValue={this.props.data.limit}>
              <option key={50} value={50}>50</option>
              <option key={100} value={100}>100</option>
              <option key={200} value={200}>200</option>
              <option key={500} value={500}>500</option>
            </select>
          </span>
        : null
      )}
      <button type="submit" key="submit">Update</button>
    </Form>
}

class UnitStats_Summary extends React.Component {
  render() {
    let data = this.props.data
    return(
      <div className="c-statsReport">
        <MetaTagsComp title={`Summary: ${data.unit_name}`}/>
        <h1>{data.unit_name}</h1>
        <h2>Summary for {data.dateStr}</h2>
        <div className="c-datatable">
          <table>
            <thead>
              <tr>
                <th scope="col">Deposits</th>
                <th scope="col">Total requests</th>
                <th scope="col">Download</th>
                <th scope="col">View-only</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{formatNum(data.posts)}</td>
                <td>{formatNum(data.hits)}</td>
                <td>{formatNum(data.downloads)}</td>
                <td>{formatNum(data.hits - data.downloads)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Top Referrers</h2>
        <div className="c-datatable">
          <table>
            <thead>
              <tr>
                {_.map(data.referrals, rd =>
                  <th scope="col" key={rd[0]}>{rd[0]}</th>
                )}
              </tr>
            </thead>
            <tbody>
              <tr>
                {_.map(data.referrals, rd =>
                  <td key={rd[0]}>{formatNum(rd[1])}</td>
                )}
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Available Reports</h2>
        <ul className="c-reportList">
          <li>
            History by:
            {data.unit_type == "journal" &&
              <Link to={`/uc/${this.props.params.unitID}/stats/history_by_issue`}>Issue</Link>}
            <Link to={`/uc/${this.props.params.unitID}/stats/history_by_item`}>Item</Link>
            {data.has_children &&
              <Link to={`/uc/${this.props.params.unitID}/stats/history_by_unit`}>Unit</Link> }
          </li>
          <li>
            Breakdown by:
            <Link to={`/uc/${this.props.params.unitID}/stats/breakdown_by_month`}>Month</Link>
            {data.unit_type == "journal" &&
              <Link to={`/uc/${this.props.params.unitID}/stats/breakdown_by_issue`}>Issue</Link>}
            <Link to={`/uc/${this.props.params.unitID}/stats/breakdown_by_item`}>Item</Link>
            {data.has_children &&
              <Link to={`/uc/${this.props.params.unitID}/stats/breakdown_by_unit`}>Unit</Link> }
          </li>
          <li>
            Referrals by: <Link to={`/uc/${this.props.params.unitID}/stats/referrals`}>Month</Link>
          </li>
          {(data.num_categories > 1 || data.has_children) &&
            <li>
              Deposits by:
              {data.num_categories > 1 &&
                <Link to={`/uc/${this.props.params.unitID}/stats/deposits_by_category`}>Category</Link>}
              {data.has_children &&
                <Link to={`/uc/${this.props.params.unitID}/stats/deposits_by_unit`}>Unit</Link>}
            </li>
          }
        </ul>
      </div>
    )
  }
}

class UnitStats_HistoryByItem extends React.Component {
  render() {
    let data = this.props.data
    return(
      <div className="c-statsReport">
        <StatsHeader title="History by Item" {...this.props}/>
        <StatsForm location={this.props.location} data={data} names={["st_yr", "st_mo", "en_yr", "en_mo", "limit"]}/>
        <div className="c-datatable">
          <table>
            <thead>
              <tr>
                <th scope="col" key="id">Item</th>
                <th scope="col" key="item" className="c-statsReport-title">Title</th>
                {data.report_months.length > 1 &&
                  <th scope="col" key="total">Total requests</th>}
                {data.report_months.map(ym =>
                  <th scope="col" key={ym}>{ymToString(ym)}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {_.map(data.report_data, (md, item) =>
                <tr key={item}>
                  <th scope="row" key="id" className="c-statsReport-id">
                    <Link to={`/uc/item/${item.replace(/^qt/, '')}`}>{item.replace(/^qt/, '')}</Link>
                  </th>
                  <td key="item" className="c-statsReport-title">
                    <ArbitraryHTMLComp html={md.title} h1Level={2}/>
                  </td>
                  {data.report_months.length > 1 &&
                    <td key="total">{formatNum(md.total_hits)}</td>}
                  {data.report_months.map(ym =>
                    <td key={ym}>{md.by_month[ym] > 0 ? formatNum(md.by_month[ym]) : null}</td>
                  )}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

class UnitStats_HistoryByIssue extends React.Component {
  render() {
    let data = this.props.data
    return(
      <div className="c-statsReport">
        <StatsHeader title="History by Issue" {...this.props}/>
        <StatsForm location={this.props.location} data={data} names={["st_yr", "st_mo", "en_yr", "en_mo"]}/>
        <div className="c-datatable">
          <table>
            <thead>
              <tr>
                <th scope="col" key="id">Vol/Iss</th>
                {data.report_months.length > 1 &&
                  <th scope="col" key="total">Total requests</th>}
                {data.report_months.map(ym =>
                  <th scope="col" key={ym}>{ymToString(ym)}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {_.map(data.report_data, issueData => {
                let issue = issueData[0]
                let md = issueData[1]
                return(
                  <tr key={issue}>
                    <th scope="row" key="id">
                      <Link to={`/uc/${this.props.params.unitID}/${md.vol_num}/${md.iss_num}`}>{issue}</Link>
                    </th>
                    {data.report_months.length > 1 &&
                      <td key="total">{formatNum(md.total_hits)}</td>}
                    {data.report_months.map(ym =>
                      <td key={ym}>{md.by_month[ym] > 0 ? formatNum(md.by_month[ym]) : null}</td>
                    )}
                  </tr>
                )}
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

class UnitStats_Referrals extends React.Component {
  render() {
    let data = this.props.data
    let months = data.report_months
    let fmonths = months.filter(val => val != 201711) // we have no referral data for this month (see note below)
    return(
      <div className="c-statsReport">
        <StatsHeader title="Referrals" {...this.props}/>
        <StatsForm location={this.props.location} data={data} names={["st_yr", "st_mo", "en_yr", "en_mo"]}/>

        {/* Let the user know there was a gap in referral data */}
        {(months.indexOf(201710) >= 0 || months.indexOf(201711) >= 0 || months.indexOf(201712) >= 0) &&
          <p>Note: Referral data was not collected from Oct 19 to Dec 4, 2017.</p>}

        <div className="c-datatable">
          <table>
            <thead>
              <tr>
                <th scope="col" key="ref">Referrer</th>
                {fmonths.length > 1 &&
                  <th scope="col" key="total">Total referrals</th>}
                {fmonths.map(ym =>
                  <th scope="col" key={ym}>{ymToString(ym)}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {_.map(data.report_data, md =>
                <tr key={md.referrer}>
                  <th scope="row" key="id">{md.referrer}</th>
                  {fmonths.length > 1 &&
                    <td key="total">{formatNum(md.total_referrals)}</td>}
                  {fmonths.map(ym =>
                    <td key={ym}>{md.by_month[ym] > 0 ? formatNum(md.by_month[ym]) : null}</td>
                  )}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

class UnitStats_BreakdownByItem extends React.Component {
  render() {
    let data = this.props.data
    return(
      <div className="c-statsReport">
        <StatsHeader title="Breakdown by Item" {...this.props}/>
        <StatsForm location={this.props.location} data={data} names={["st_yr", "st_mo", "en_yr", "en_mo", "limit"]}/>
        <div className="c-datatable">
          <table>
            <thead>
              <tr>
                <th scope="col">Item</th>
                <th scope="col" className="c-statsReport-title">Title</th>
                <th scope="col">Total requests</th>
                <th scope="col">Download</th>
                <th scope="col">View-only</th>
              </tr>
            </thead>
            <tbody>
              {_.map(data.report_data, (md, item) =>
                <tr key={item}>
                  <th scope="row" className="c-statsReport-id">
                    <Link to={`/uc/item/${item.replace(/^qt/, '')}`}>{item.replace(/^qt/, '')}</Link>
                  </th>
                  <th className="c-statsReport-title">
                    <ArbitraryHTMLComp html={md.title} h1Level={2}/>
                  </th>
                  <td>{formatNum(md.total_hits)}</td>
                  <td>{formatNum(md.total_downloads)}</td>
                  <td>{formatNum(md.total_hits - md.total_downloads)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

class UnitStats_BreakdownByIssue extends React.Component {
  render() {
    let data = this.props.data
    return(
      <div className="c-statsReport">
        <StatsHeader title="Breakdown by Issue" {...this.props}/>
        <StatsForm location={this.props.location} data={data} names={["st_yr", "st_mo", "en_yr", "en_mo"]}/>
        <div className="c-datatable">
          <table>
            <thead>
              <tr>
                <th scope="col">Vol/Iss</th>
                <th scope="col">Total requests</th>
                <th scope="col">Download</th>
                <th scope="col">View-only</th>
              </tr>
            </thead>
            <tbody>
              {_.map(data.report_data, issueData => {
                let issue = issueData[0]
                let md = issueData[1]
                return(
                  <tr key={issue}>
                    <th scope="row">
                      <Link to={`/uc/${this.props.params.unitID}/${md.vol_num}/${md.iss_num}`}>{issue}</Link>
                    </th>
                    <td>{formatNum(md.total_hits)}</td>
                    <td>{formatNum(md.total_downloads)}</td>
                    <td>{formatNum(md.total_hits - md.total_downloads)}</td>
                  </tr>
                )}
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

class UnitStats_BreakdownByMonth extends React.Component {
  render() {
    let data = this.props.data
    return(
      <div className="c-statsReport">
        <MetaTagsComp title={`Breakdown by Month: ${data.unit_name}`}/>
        <h1><Link to={`/uc/${this.props.params.unitID}/stats`}>{data.unit_name}</Link></h1>
        <h2>Stats: Breakdown by Month</h2>
        <div className="c-datatable">
          <table>
            <thead>
              <tr>
                <th scope="col">Month</th>
                <th scope="col">Deposits</th>
                <th scope="col">Total requests</th>
                <th scope="col">Download</th>
                <th scope="col">View-only</th>
              </tr>
            </thead>
            <tbody>
              {_.map(data.report_data, md =>
                <tr key={md[0]}>
                  <th scope="row">{ymToString(md[0])}</th>
                  <td>{formatNum(md[1])}</td>
                  <td>{formatNum(md[2])}</td>
                  <td>{formatNum(md[3])}</td>
                  <td>{formatNum(md[2] - md[3])}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

class UnitStats_DepositsByCategory extends React.Component {
  render() {
    let data = this.props.data
    return(
      <div className="c-statsReport">
        <StatsHeader title="Deposits by Category" {...this.props}/>
        <StatsForm location={this.props.location} data={data} names={["st_yr", "st_mo", "en_yr", "en_mo"]}/>
        <div className="c-datatable">
          <table>
            <thead>
              <tr>
                <th scope="col" key="id">Category</th>
                {data.report_months.length > 1 &&
                  <th scope="col" key="total">Total deposits</th>}
                {data.report_months.map(ym =>
                  <th scope="col" key={ym}>{ymToString(ym)}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {_.map(data.report_data, cd =>
                <tr key={cd.category}>
                  <th scope="row" key="id">{cd.category.replace(/^postprints:/, "\xa0\xa0\xa0\xa0")}</th>
                  {data.report_months.length > 1 &&
                    <td key="total">{formatNum(cd.total_deposits)}</td>}
                  {data.report_months.map(ym =>
                    <td key={ym}>{formatNum(cd.by_month[ym] > 0 ? cd.by_month[ym] : null)}</td>
                  )}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

class UnitStats_DepositsByUnit extends React.Component {
  render() {
    let data = this.props.data
    return(
      <div className="c-statsReport">
        <StatsHeader title="Deposits by Unit" {...this.props}/>
        <StatsForm location={this.props.location} data={data} names={["st_yr", "st_mo", "en_yr", "en_mo"]}/>
        <div className="c-datatable">
          <table>
            <thead>
              <tr>
                <th scope="col" key="id">Unit</th>
                {data.any_drill_down &&
                  <th scope="col" key="dd">Drill down</th>}
                {data.report_months.length > 1 &&
                  <th scope="col" key="total">Total deposits</th>}
                {data.report_months.map(ym =>
                  <th scope="col" key={ym}>{ymToString(ym)}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {_.map(data.report_data, cd =>
                <tr key={cd.unit_name}>
                  <th scope="row" key="id">
                    {cd.unit_name != "Overall" ?
                      <Link to={`/uc/${cd.unit_id}/stats`}>{cd.unit_name}</Link> :
                      cd.unit_name }
                  </th>
                  {data.any_drill_down &&
                    <td key="dd">
                      {cd.child_types &&
                        <Link to={`/uc/${cd.unit_id}/stats/deposits_by_unit${this.props.location.search}`}>{describeChildren(cd.child_types)}</Link>}
                    </td>
                  }
                  {data.report_months.length > 1 &&
                    <td key="total">{formatNum(cd.total_deposits)}</td>}
                  {data.report_months.map(ym =>
                    <td key={ym}>{formatNum(cd.by_month[ym] > 0 ? cd.by_month[ym] : null)}</td>
                  )}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

class UnitStats_HistoryByUnit extends React.Component {
  render() {
    let p = this.props
    return(
      <div className="c-statsReport">
        <StatsHeader title="History by Unit" {...p}/>
        <StatsForm names={["st_yr", "st_mo", "en_yr", "en_mo"]} {...p}/>
        <div className="c-datatable">
          <table>
            <thead>
              <tr>
                <th scope="col" key="id">Unit</th>
                {p.data.any_drill_down &&
                  <th scope="col" key="dd">Drill down</th>}
                {p.data.report_months.length > 1 &&
                  <th scope="col" key="total">Total requests</th>}
                {p.data.report_months.map(ym =>
                  <th scope="col" key={ym}>{ymToString(ym)}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {_.map(p.data.report_data, cd =>
                <tr key={cd.unit_name}>
                  <th scope="row" key="id">
                    {cd.unit_name != "Overall" ?
                      <Link to={`/uc/${cd.unit_id}/stats`}>{cd.unit_name}</Link> :
                      cd.unit_name }
                  </th>
                  {p.data.any_drill_down &&
                    <td key="dd">
                      {cd.child_types &&
                        <Link to={`/uc/${cd.unit_id}/stats/${p.params.pageName}${p.location.search}`}>{describeChildren(cd.child_types)}</Link>}
                    </td>
                  }
                  {p.data.report_months.length > 1 &&
                    <td key="total">{formatNum(cd.total_requests)}</td>}
                  {p.data.report_months.map(ym =>
                    <td key={ym}>{formatNum(cd.by_month[ym] > 0 ? cd.by_month[ym] : null)}</td>
                  )}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

class UnitStats_BreakdownByUnit extends React.Component {
  render() {
    let p = this.props
    return(
      <div className="c-statsReport">
        <StatsHeader title="History by Unit" {...p}/>
        <StatsForm names={["st_yr", "st_mo", "en_yr", "en_mo"]} {...p}/>
        <div className="c-datatable">
          <table>
            <thead>
              <tr>
                <th scope="col" key="id">Unit</th>
                {p.data.any_drill_down &&
                  <th scope="col" key="dd">Drill down</th>}
                <th scope="col" key="total">Total requests</th>
                <th scope="col">Download</th>
                <th scope="col">View-only</th>
              </tr>
            </thead>
            <tbody>
              {_.map(p.data.report_data, cd =>
                <tr key={cd.unit_name}>
                  <th scope="row" key="id">
                    {cd.unit_name != "Overall" ?
                      <Link to={`/uc/${cd.unit_id}/stats`}>{cd.unit_name}</Link> :
                      cd.unit_name }
                  </th>
                  {p.data.any_drill_down &&
                    <th key="dd">
                      {cd.child_types &&
                        <Link to={`/uc/${cd.unit_id}/stats/${p.params.pageName}${p.location.search}`}>{describeChildren(cd.child_types)}</Link>}
                    </th>
                  }
                  <td>{formatNum(cd.total_requests)}</td>
                  <td>{formatNum(cd.total_downloads)}</td>
                  <td>{formatNum(cd.total_requests - cd.total_downloads)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

export default class StatsPage extends PageBase
{
  pageDataURL() {
    const pm = this.props.params
    return `/api/unit/${pm.unitID}/stats/${pm.pageName || "summary"}${this.props.location.search}`
  }

  needHeaderFooter() { return false } //  disable standard header and footer

  renderContent() {
    // Error case
    if (this.state.pageData && this.state.pageData.error)
      return this.renderError()

    // Normal case -- a little different from PageBase in that we also render as loading when fetching data.
    return (this.state.pageData && !this.state.fetchingData) ? this.renderData(this.state.pageData) : this.renderLoading()
  }

  renderData(data) {
    const pageName = this.props.params.pageName || "summary"
    if (pageName == "summary")
      return <UnitStats_Summary data={data} {...this.props}/>
    else if (pageName == "history_by_item")
      return <UnitStats_HistoryByItem data={data} {...this.props}/>
    else if (pageName == "history_by_issue")
      return <UnitStats_HistoryByIssue data={data} {...this.props}/>
    else if (pageName == "breakdown_by_item")
      return <UnitStats_BreakdownByItem data={data} {...this.props}/>
    else if (pageName == "breakdown_by_issue")
      return <UnitStats_BreakdownByIssue data={data} {...this.props}/>
    else if (pageName == "breakdown_by_month")
      return <UnitStats_BreakdownByMonth data={data} {...this.props}/>
    else if (pageName == "referrals")
      return <UnitStats_Referrals data={data} {...this.props}/>
    else if (pageName == "deposits_by_category")
      return <UnitStats_DepositsByCategory data={data} {...this.props}/>
    else if (pageName == "deposits_by_unit")
      return <UnitStats_DepositsByUnit data={data} {...this.props}/>
    else if (pageName == "history_by_unit")
      return <UnitStats_HistoryByUnit data={data} {...this.props}/>
    else if (pageName == "breakdown_by_unit")
      return <UnitStats_BreakdownByUnit data={data} {...this.props}/>
  }
}
