import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';

const App = () => {
  const [currencyList, setCurrencyList] = useState({});
  const [sortBy, setSortBy] = useState('currency');
  const [sortByKey, setSortByKey] = useState();
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    Object.keys(currencyList).length === 0 && axios
      .get('http://localhost:2345/currency')
      .then(({data}) => {
      // console.log(data)

      setCurrencyList(data)
    })
  })

  const toggleSortByCurrency = () => {
    if (sortBy !== 'currency') {
      setSortBy('currency');
    }
    setSortOrder(sortOrder === 'asc' ? 'dsc' : 'asc')
  }

  const toggleSortByCurrencyRate = currencyRateMapKey => {
    if (sortBy !== 'currencyRate') {
      setSortBy('currencyRate');
    }
    // console.log(sortByKey, currencyRateMapKey)
    if (sortByKey !== currencyRateMapKey) {
      setSortByKey(currencyRateMapKey);
    } else {
      setSortOrder(sortOrder === 'asc' ? 'dsc' : 'asc')
    }
  }

  const toggleSortByRateChange = currencyRateMapKey => {
    if (sortBy !== 'rateChange') {
      setSortBy('rateChange');
    }
    // console.log(sortByKey, currencyRateMapKey)
    if (sortByKey !== currencyRateMapKey) {
      setSortByKey(currencyRateMapKey);
    } else {
      setSortOrder(sortOrder === 'asc' ? 'dsc' : 'asc')
    }
  }

  const renderCurrencyListHeader = () => {
    const currencyKeyList = Object.keys(currencyList);
    if (currencyKeyList.length) {
      return [
        [
          <div className="currency__currency-label">Date</div>,
          ...currencyKeyList.map(date => {
            return (
              <div className="currency__title" key={date}>{date}</div>
            )
          })
        ],
        [
          <div className="currency__currency-label">
              <span>Currency</span>
              <button 
                className={`currency__button${sortBy === 'currency' ? '--selected': ''}`} 
                onClick={toggleSortByCurrency}>Sort {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
          </div>,
          ...currencyKeyList.map((date, currencyRateMapKey) => {
            return (
              <div className="currency__title" key={date}>
                {
                  currencyRateMapKey && 
                  <button 
                    className={`currency__button${sortBy === 'rateChange' && sortByKey === currencyRateMapKey ? '--selected': ''}`}
                    onClick={() => toggleSortByRateChange(currencyRateMapKey)}>RC {sortOrder === 'asc' ? '↑' : '↓'}</button>}
                <span>
                  {currencyList[date].base}
                </span>
                <button 
                  className={`currency__button${sortBy === 'currencyRate' && sortByKey === currencyRateMapKey ? '--selected': ''}`}
                  onClick={() => toggleSortByCurrencyRate(currencyRateMapKey)}>CR {sortOrder === 'asc' ? '↑' : '↓'}</button>
              </div>
            )
          })
        ],
      ]
    }
  }

  const renderCurrencyList = () => {
    const currencyKeyList = Object.keys(currencyList);
    if (currencyKeyList.length) {
      const currencyRatesKeyList = Object.keys(currencyList[currencyKeyList[0]].rates)
      let newDataStructure = currencyRatesKeyList.map(currencyRateKey => ({
        currencyRateKey,
        exchangeRateList: currencyKeyList.map(ck => currencyList[ck].rates[currencyRateKey]),
        percentageChangeList: currencyKeyList.map((currencyKey, k) => {
          return k ? ~~((1 - currencyList[currencyKey].rates[currencyRateKey] / currencyList[currencyKeyList[k - 1]].rates[currencyRateKey]) * 1000) / 1000 : 0
        })
      }))
      // newDataStructure.map( x => ({...x, min: Math.min(...x.percentageChangeList), max: Math.max(...x.percentageChangeList)}))

      // figure out which variation is the greatest for a particular day
      const variationList = currencyKeyList.map((v, index) => {
        const variationList = newDataStructure.map(v => v.percentageChangeList[index]);
        const minVariation = Math.min(...variationList);
        const maxVariation = Math.max(...variationList);

        if (Math.abs(minVariation) > maxVariation) {
          return minVariation
        } else {
          return maxVariation
        }
      })

      console.log(variationList)

      // this is where we apply the sorting
      newDataStructure = newDataStructure.sort((a, b) => {
        if (sortBy === 'currency') {
          return sortOrder === 'asc' ? a.currencyRateKey.localeCompare(b.currencyRateKey) : b.currencyRateKey.localeCompare(a.currencyRateKey)
        } else if (sortBy === 'currencyRate') {
          return sortOrder === 'asc' ? a.exchangeRateList[sortByKey] - b.exchangeRateList[sortByKey] : b.exchangeRateList[sortByKey] - a.exchangeRateList[sortByKey]
        } else if (sortBy === 'rateChange') {
          return sortOrder === 'asc' ? a.percentageChangeList[sortByKey] - b.percentageChangeList[sortByKey] : b.percentageChangeList[sortByKey] - a.percentageChangeList[sortByKey]
        }
      })

      return [
        ...newDataStructure.map(({currencyRateKey, exchangeRateList, percentageChangeList}) => {
          return [
            <div className="currency__currency-label">{currencyRateKey}</div>,
            exchangeRateList.map((exchangeRate, k) => (
              <div className={`currency__currency-rate${k && percentageChangeList[k] === variationList[k] ? ' big': ''}`} key={k}>
                {k && <div className="currency__variation"> {percentageChangeList[k]}%</div>}
                <div>{exchangeRate}</div>
              </div>
              )
            ),
          ]
        })
      ]
    }
  }

  return (
    <>
      <div className="currency__wrapper">
        {renderCurrencyListHeader()}
      </div>
      <div className="currency__wrapper">
        {renderCurrencyList()}
      </div>
    </>
    );
}

export default App;
