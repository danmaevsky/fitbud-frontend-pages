import { useState, useEffect } from "react";
import "./DemoPage.css";
import Html5QrcodePlugin from "../components/Html5QrcodePlugin";

function DemoPage(props) {
    return (
        <div id="demo-page">
            <div id="demo-page-searches">
                <SearchDemo type="food" message="Search for a Food!" />
                <SearchDemo type="exercise" message="Search for an Exercise!" radioChoices={["Cardio", "Strength"]} />
            </div>
            <div id="demo-page-row2">
                <LoginDemo />
                <CreateAccountDemo />
            </div>
            <div id="demo-page-row3">
                <BarcodeDemo />
            </div>
        </div>
    );
}

function CreateAccountDemo(props) {
    // required
    // email
    // password
    // firstName
    // lastName
    // sex
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [sex, setSex] = useState("");

    const createCallback = () => {
        fetch(`${process.env.REACT_APP_GATEWAY_URI}/account/createAccount`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email,
                password: password,
                firstName: firstName,
                lastName: lastName,
                sex: sex,
            }),
        })
            .then((res) => res.json)
            .then((json) => console.log("Account with userId " + json.userId + " created"));
    };

    return (
        <div>
            <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            <input type="text" placeholder="Sex" value={sex} onChange={(e) => setSex(e.target.value)} />
            <button onClick={createCallback}>Create Account</button>
        </div>
    );
}

function LoginDemo(props) {
    const [accessToken, setAccessToken] = useState(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const loginCallback = () => {
        let temp;
        let tempToken;
        fetch(`${process.env.REACT_APP_GATEWAY_URI}/account/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        })
            .then((res) => {
                temp = res.status;
                return res.json();
            })
            .then((json) => {
                if (temp !== 200) {
                    setErrorMessage(json.message);
                    throw new Error("issue");
                }
                tempToken = json.accessToken;
                return fetch(`${process.env.REACT_APP_GATEWAY_URI}/profile/users`, {
                    method: "GET",
                    headers: { Authorization: "Bearer " + json.accessToken },
                });
            })
            .then((res) => res.json())
            .then((json) => {
                setName(json.firstName);
                setAccessToken(tempToken);
            })
            .catch((err) => {
                console.log(err);
                setName(null);
            });
    };

    const logoutCallback = () => {
        let temp;
        fetch(`${process.env.REACT_APP_GATEWAY_URI}/account/logout`, {
            method: "POST",
            headers: { Authorization: "Bearer " + accessToken },
        }).then((res) => {
            if (res.status !== 200) {
                setErrorMessage("Fucky wucky");
                throw Error("ugh");
            }
            setName(null);
            setAccessToken(null);
            setErrorMessage(null);
            setEmail("");
            setPassword("");
        });
    };

    return (
        <div>
            {!name && <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />}
            {!name && <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />}
            {!name && <button onClick={loginCallback}>Login</button>}
            {name && <p>Hello {name}!</p>}
            {name && <button onClick={logoutCallback}>Logout</button>}
            {errorMessage && !name && <p>Error! {errorMessage}</p>}
        </div>
    );
}

function BarcodeDemo(props) {
    const [barcodeText, setBarcodeText] = useState("");
    const [barcodeResponse, setBarcodeResponse] = useState(null);
    const [barcodeResponseStatus, setBarcodeResponseStatus] = useState(null);
    const onBarcodeScan = (decodedText, decodedResult) => {
        let temp;
        fetch(`${process.env.REACT_APP_GATEWAY_URI}/food/?barcode=${decodedText}`)
            .then((res) => {
                temp = res.status;
                return res.json();
            })
            .then((json) => {
                setBarcodeText(decodedText);
                setBarcodeResponseStatus(temp);
                setBarcodeResponse(json);
            });
    };
    return (
        <div id="barcode-demo">
            {barcodeResponse && barcodeResponseStatus === 200 && <SearchResult type="food" result={barcodeResponse} />}
            <p>Scanned Code: {barcodeText}</p>
            <Html5QrcodePlugin qrCodeSuccessCallback={onBarcodeScan} qrbox={{ height: 150, width: 300 }} disableFlip={false} fps={10} />
        </div>
    );
}

function SearchResult(props) {
    const type = props.type;
    const result = props.result;

    if (type === "food") {
        return (
            <li className="demo-page-search-result">
                <div>
                    <h5>
                        {result.name
                            .toLowerCase()
                            .split(" ")
                            .map((s) => {
                                if (s === "bbq") {
                                    return "BBQ";
                                }
                                return s.charAt(0).toUpperCase() + s.substring(1);
                            })
                            .join(" ")}
                    </h5>
                    {result.brandName ? <p>{result.brandName}</p> : null}
                </div>
            </li>
        );
    }

    if (type === "exercise") {
        return (
            <li className="demo-page-search-result">
                <div>
                    <h5>{result.name}</h5>
                </div>
            </li>
        );
    }
}

function SearchDemo(props) {
    const type = props.type;
    const message = props.message;
    const radioChoices = props.radioChoices;

    const numResults = 50;

    const [results, setResults] = useState(null);
    const [resultPage, setResultPage] = useState(0);
    const [responseStatus, setResponseStatus] = useState(200);
    const [radio, setRadio] = useState("Strength");
    const onRadioChange = (e) => {
        setRadio(e.target.value);
    };

    useEffect(() => {
        console.log(results);
    }, [results]);

    let onSubmit;
    if (type === "food") {
        onSubmit = (query) => {
            let temp;
            fetch(`${process.env.REACT_APP_GATEWAY_URI}/food/?search=${query}`)
                .then((res) => {
                    temp = res.status;
                    return res.json();
                })
                .then((json) => {
                    setResponseStatus(temp);
                    setResults(json);
                });
        };
    } else if (type === "exercise") {
        onSubmit = (query) => {
            let temp;
            console.log(query);
            fetch(`${process.env.REACT_APP_GATEWAY_URI}/exercise/${radio}/?search=${query}`)
                .then((res) => {
                    temp = res.status;
                    return res.json();
                })
                .then((json) => {
                    setResponseStatus(temp);
                    setResults(json);
                });
        };
    }

    let incrementPage = () => {
        if (resultPage >= 10) {
            return;
        }
        setResultPage(resultPage + 1);
    };

    let decrementPage = () => {
        if (resultPage <= 0) {
            return;
        }
        setResultPage(resultPage - 1);
    };

    return (
        <div className={`search-demo search-demo-${type}`}>
            <h2>{message}</h2>
            <SearchBox onSubmit={onSubmit} />
            {radioChoices ? (
                <form>
                    {radioChoices.map((s) => (
                        <label>
                            <input className="search-demo-radio" type="radio" name="radio-group" value={s} onChange={onRadioChange} />
                            {s}
                        </label>
                    ))}
                </form>
            ) : null}
            {results && responseStatus === 200 ? (
                <ul className="search-demo-results">
                    {results.slice(numResults * resultPage, numResults * (1 + resultPage)).map((r) => {
                        return <SearchResult type={type} result={r} />;
                    })}
                </ul>
            ) : null}
            {responseStatus !== 200 ? "404 Not Found" : null}
            <div className="search-demo-page-buttons">
                <button onClick={decrementPage}>Prev</button>
                <button onClick={incrementPage}>Next</button>
            </div>
        </div>
    );
}

function SearchBox(props) {
    const onSubmit = props.onSubmit;
    const [textValue, setTextValue] = useState("");
    return (
        <div className="demo-page-search-box">
            <input
                className="demo-page-search-box-input"
                type="text"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        onSubmit(textValue);
                        return;
                    }
                }} 
            ></input>
            <button className="demo-page-search-box-submit" onClick={() => onSubmit(textValue)}></button>
        </div>
    );
}

export default DemoPage;
