import React, { useEffect, useState, useContext} from "react";
import { BreakpointProvider, setDefaultBreakpoints } from "react-socks";
import { Link, LinkProps } from 'react-router-dom';
import useOnclickOutside from "react-cool-onclickoutside";
import { useWeb3React } from '@web3-react/core'


setDefaultBreakpoints([
  { xs: 0 },
  { l: 1199 },
  { xl: 1200 }
]);



const Header= function() {

    const [openMenu, setOpenMenu] = React.useState(false);
    const [openMenu1, setOpenMenu1] = React.useState(false);
    const [openMenu2, setOpenMenu2] = React.useState(false);
    const [openMenu3, setOpenMenu3] = React.useState(false);

    const { connector, isActivating, isActive, account, chainId, ENSName } = useWeb3React()
    const [error, setError] = useState<Error | undefined>()

    const connect = () => {
      localStorage.removeItem('deactivated')
  
      connector
        .activate()
        ?.then(() => setError(undefined))
        ?.catch(setError)
    }

    const disconnect = async () => {
      localStorage.setItem('deactivated', 'true')
      if (connector?.deactivate) {
        await connector.deactivate()
      } else {
        await connector.resetState()
      }
    }


    const handleBtnClick = () => {
      setOpenMenu(!openMenu);
    };
    const handleBtnClick1 = () => {
      setOpenMenu1(!openMenu1);
    };
    const handleBtnClick2 = () => {
      setOpenMenu2(!openMenu2);
    };
    const handleBtnClick3 = () => {
      setOpenMenu3(!openMenu3);
    };
    const closeMenu = () => {
      setOpenMenu(false);
    };
    const closeMenu1 = () => {
      setOpenMenu1(false);
    };
    const closeMenu2 = () => {
      setOpenMenu2(false);
    };
    const closeMenu3 = () => {
      setOpenMenu3(false);
    };
    const ref = useOnclickOutside(() => {
      closeMenu();
    });
    const ref1 = useOnclickOutside(() => {
      closeMenu1();
    });
    const ref2 = useOnclickOutside(() => {
      closeMenu2();
    });
    const ref3 = useOnclickOutside(() => {
      closeMenu3();
    });

    const [showmenu, btn_icon] = useState(false);
    useEffect(() => {
    const header = document.getElementById("myHeader");
    const totop = document.getElementById("scroll-to-top");
    const sticky = header?.offsetTop;
    const scrollCallBack = () => {
      btn_icon(false);
        if (window.pageYOffset > sticky!) {
          header?.classList.add("sticky");
          totop?.classList.add("show");
          
        } else {
          header?.classList.remove("sticky");
          totop?.classList.remove("show");
        } if (window.pageYOffset > sticky!) {
          closeMenu();
        }
    }
    window.addEventListener("scroll", scrollCallBack)
      return () => {
        window.removeEventListener("scroll", scrollCallBack);
      };
    }, []);
    return (
    <header id="myHeader" className='navbar white'>
     <div className='container'>
       <div className='row' style={{width:"90%"}}>

          <div className='search' style = {{width: "25%"}}>
            <input id="quick_search" className="xs-hide" name="quick_search" placeholder="Search for items here..." type="text" />
          </div> 
    
          <div style = {{width: "20%"}}></div>
          <div style = {{width: "8%"}}>
            <Link to="/" onClick={() => btn_icon(!showmenu)}>
              Home
            </Link>
          </div>
          <div style = {{width: "9%"}}>
            <Link to="/profile" onClick={() => btn_icon(!showmenu)}>
              Auctions
            </Link>
          </div>
          <div style = {{width: "8%"}}>
            <Link to="/holdings" onClick={() => btn_icon(!showmenu)}>
              Loans
            </Link>
          </div>
          <div style = {{width: "8%"}}>
            <Link to="/mint" onClick={() => btn_icon(!showmenu)}>
              Leagues
            </Link>
          </div>
          <div className='mainside' style = {{width: "15%"}}>
            
          {!isActive &&
                
                  <button  className="btn-main" onClick={() => {connect()}}>
                    Connect
                  </button>
              
            
            }
            
            {isActive && 
              <button onClick= {disconnect} className="btn-main">Disconnect</button>
            }
          </div>
        </div>
                  
      </div>           
    </header>
    );
}
export default Header;