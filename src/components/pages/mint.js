import InsuranceNFT from '../../abis/InsuranceNFT.json';
import Verify from '../../abis/Verify.json';
import InsuranceDAO from '../../abis/InsuranceDAO.json';
import React, { useState, useContext, useEffect } from "react";
import Footer from '../components/Footer';
import { useWeb3React } from "@web3-react/core";
import { AccountContext } from '../App';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { formatEther } from '@ethersproject/units';

const Web3 = require('web3');

const Mint = function() {
  const [files, setFiles] = useState([]);
  const [fileURL, setFileURL] = useState("");
  const [start, setStart] = useState(0);
  const [dateTime, setDateTime] = useState("");
  const [currentImageURI, setCurrentImageURI] = useState("");
  const [amountRuns, setAmountRuns] = useState(100);
  const [penaltyLevels, setPenaltyLevels] = useState([]);
  const [accLevels, setAccLevels] = useState([]);
  const [costLevels, setCostLevels] = useState([]);
  const [NFTContract, setNFTContract] = useState();
  const [VerifyContract, setVerifyContract] = useState();
  const [DAOContract, setDAOContract] = useState();


  const { active, account, chainId, library, connector, activate, deactivate } = useWeb3React();

  const {globalAccount, setGlobalAccount, globalActive, setGlobalActive , globalChainId, setGlobalChainId} = useContext(AccountContext);

  useEffect(() => {
    const loadUserNFTData = async () => {
      if(active){
        const response = await fetch(`/user-nfts/${account}`);
        const body = await response.json();
        if(body.start !== 0){
          setStart(body.start);
          setDateTime(dateTimeUnixConverter(Number(body.start) + 60, true));
        }
        else{
          setStart(0);
          setDateTime(dateTimeUnixConverter(Math.round(Date.now()/1000), true));
        }
      }
      else{
        setStart(0);
        setDateTime(dateTimeUnixConverter(Math.round(Date.now()/1000), true));
      }
      setGlobalAccount(account);
      setGlobalActive(active);
      setGlobalChainId(chainId);
      setFiles([]);
      setFileURL("");
      }
    
      loadUserNFTData()
      .catch(console.error);

  }, [account, active, chainId, globalActive, globalAccount, globalChainId])

  useEffect(() => {
    const loadWeb3 = async () => {
        if (window.ethereum) {
          window.web3 = new Web3(window.ethereum)
          await window.ethereum.enable()
        }
        else if (window.web3) {
          window.web3 = new Web3(window.web3.currentProvider)
        }
        else {
          window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
      }

      const loadBlockchainData = async () => {
        const web3 = window.web3;
        const InsuranceNFTData = InsuranceNFT.networks[chainId];
        const VerifyData = Verify.networks[chainId];
        const InsuranceDAOData = InsuranceDAO.networks[chainId];
        if(InsuranceNFTData){
          const NFTContract = new web3.eth.Contract(InsuranceNFT.abi, InsuranceNFTData.address);
          const VerifyContract = new web3.eth.Contract(Verify.abi, VerifyData.address);
          const DAOContract = new web3.eth.Contract(InsuranceDAO.abi, InsuranceDAOData.address);
          setNFTContract(NFTContract);
          setVerifyContract(VerifyContract);
          setDAOContract(DAOContract);
          const penaltyLevels = await DAOContract.methods.getPenaltyLevels().call();
          const accLevels = await DAOContract.methods.getAccLevels().call();
          const costLevels = await DAOContract.methods.getCosts().call();
          setPenaltyLevels(penaltyLevels);
          setAccLevels(accLevels);
          setCostLevels(costLevels);
        }
        else{
          setNFTContract(null);
          setVerifyContract(null);
          setDAOContract(null);
          window.alert('contract not deployed to detected network.');
        }
      }

      loadWeb3()
      .catch(console.error);
      loadBlockchainData()
      .catch(console.error);

    }, [account, active, chainId, globalActive, globalAccount, globalChainId])

  function fileLoad(e) {
    var newFiles = e.target.files;
    console.log(newFiles);
    var filesArr = Array.prototype.slice.call(newFiles);
    console.log(filesArr);
    setFiles([...filesArr]);
    setFileURL(URL.createObjectURL(newFiles[0]));
  }

  const imageMap = {"0xA072f8Bd3847E21C8EdaAf38D7425631a2A63631" : "author-1", "0x3fd431F425101cCBeB8618A969Ed8AA7DFD115Ca": "author-2", 
    "0x42F9EC8f86B5829123fCB789B1242FacA6E4ef91" : "author-3", "0xa0Bb0815A778542454A26C325a5Ba2301C063b8c" : "author-4"}

  const ratingMap = {"1" : "Poor", "2" : "Fair", "3" : "Good", "4" : "Great", "5" : "Pristine"}

  function dateTimeUnixConverter(time, unixTime){
    if(unixTime){
      //convert to datetime
      var date = new Date(time * 1000);
      return `${date.getFullYear()}-${date.getMonth() < 9 ? `0${date.getMonth()+1}` : `${date.getMonth()+1}`}-${date.getDate() < 10 ? `0${date.getDate()}` : `${date.getDate()}`}T${date.getHours() < 10 ? `0${date.getHours()}` : `${date.getHours()}`}:${date.getMinutes() < 10 ? `0${date.getMinutes()}` : `${date.getMinutes()}`}`
    }
  }

  const startMint = async () => {
    if(!active){
      window.alert("connect with wallet");
      return;
    }
    if (files.length === 0 ){
      window.alert("upload an image before minting");
      return;
    }
    const file = files[0];
    if(!(['jpg', 'png', 'gif', 'mp4'].includes(file.name.slice(-3).toLowerCase())) && file.name.slice(-4).toLowerCase() !== 'webp'){
      window.alert("incorrect file extension");
      return;
    }
    const startMint = Math.round(Number(Date.parse(dateTime))/1000);
    if(start ==0){
      if(startMint < (Math.round(Date.now()/1000) - 12*30*24*3600)){
        window.alert('must choose a start time within past year!');
        return;
      } 
    }
    else if (start <= startMint){
      window.alert('choose a start time after timestamp of your last data used in NFTs!');
        return;
    }
    const formData = new FormData();
    formData.append('avatar', file);

    const mintRes = await axios.post(`/mint-upload/${account}`, formData, {
    headers: {
      'Content-type': 'multipart/form-data'
    }
  });

  //alert uploaded to pinata
  setCurrentImageURI(mintRes.imageURL);

  //call mint function with start, runs, and image URI
  

}

    return (
      <div>

        <section className='jumbotron breadcrumb no-bg'>
          <div className='mainbreadcrumb'>
            <div className='container'>
              <div className='row m-10-hor'>
                <div className='col-12'>
                  <h1 className='text-center'>Mint</h1>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='container' style={{paddingBottom: "0.1em"}}>
      {Math.round(Number(Date.parse(dateTime))/1000)}
        <div className="row">
          <div className="col-lg-7 offset-lg-1 mb-5">
              <form id="form-create-item" className="form-border" action="#">
                  <div className="field-set">
                      <h5>Upload file</h5>

                      <div className="d-create-file">
                          {files.length === 0 && <p id="file_name">PNG, JPG, GIF, WEBP or MP4. Max 200mb.</p>}
                          {files.map((x, index) => 
                          <p key={`${index}`}>{x.name}</p>
                          )}
                          <div className='browse'>
                            <input type="button" id="get_file" className="btn-main" value="Browse"/>
                            <input id='upload_file' type="file" onChange={fileLoad} />
                          </div>
                          
                      </div>

                      <div className="spacer-single"></div>

                      <h5>Data Points (min: 100, max : 500)</h5>
                      <input type="number" name="item_title" id="item_title" className="form-control" value = {amountRuns} onChange = {(e) => {setAmountRuns(e.target.value)}} />

                      <div className="spacer-10"></div>

                      <h5>Start Date</h5>
                      <input type="datetime-local" name="start_date" id="start_date" className="form-control" value = {dateTime} onChange = {(e) => {setDateTime(e.target.value)}}/>

                      <div className="spacer-10"></div>

                      <input type="button" id="submit" className="btn-main" value="Mint Now" onClick={startMint}/>
                  </div>
              </form>
          </div>

          <div className="col-lg-3 col-sm-6 col-xs-12">
                  <h5>Preview item</h5>
                  <div className="nft__item m-0">
                      
                      <div className="author_list_pp">
                          <span>                                    
                              <img className="lazy" src={`./img/author/${(account in imageMap) ? imageMap[account] : "author-5"}.jpg`} alt=""/>
                              <i className="fa fa-check"></i>
                          </span>
                      </div>
                      <div className="nft__item_wrap">
                          <span>
                              <img src={`${(files.length > 0) ? fileURL : "./img/collections/coll-item-3.jpg"}`} id="get_file_2" className="lazy nft__item_preview" alt=""/>
                          </span>
                      </div>
                  </div>
              </div>                                         
      </div>

      </section>

      {penaltyLevels.length > 0 && <section className='container' style={{paddingTop:0}}>
      <div className="row">
          <div className="col-lg-5 mb-5" >
            <Table striped bordered hover size="md" >
              <thead style={{backgroundColor: "white", border : "2px solid black"}}>
                <tr>
                <th>Levels</th>
                <th>Penalty Score</th>
                <th>Acc Levels</th>
                
                </tr>
              </thead>
              <tbody>
                  {penaltyLevels.map((val, index) => {
                    let currentVal =0;
                    if(index > 0){
                      for(var i =0; i<=index; i++){
                        currentVal += Number(penaltyLevels[i]);
                      }
                    }
                    return (<tr style={{backgroundColor: "white", border : "2px solid black"}}>
                              <td>{index+1}</td>
                              {index===0 ? <td>{val}</td> : <td>{currentVal}</td>}
                              <td>{accLevels[index]}</td>
                              {/*<td>{formatEther(costLevels[index])} ETH</td>*/}
                            </tr>)
                  })}
              </tbody>        

            </Table>
          </div>
          
          <div className="col-lg-5 offset-lg-1 mb-5" >
              <Table striped bordered hover size="md" >
                <thead style={{backgroundColor: "white", border : "2px solid black"}}>
                  <tr>
                    <th>Rating</th>
                    <th>DAO Costs</th>                 
                  </tr>
                </thead>
                <tbody>
                    {costLevels.map((val, index) => {
                      return (<tr style={{backgroundColor: "white", border : "2px solid black"}}>
                                <td>{ratingMap[index+1]}</td>                                
                                <td>{formatEther(costLevels[index])} ETH</td>
                              </tr>)
                    })}
                </tbody>        

              </Table>
          </div>
        </div>
      </section>}

        <Footer />
      </div>
   );
  
}
export default Mint;