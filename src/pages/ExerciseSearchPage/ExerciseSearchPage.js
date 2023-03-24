import magnifyingGlass from "assets/magnifying-glass.svg";
import "./ExerciseSearchPage.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useSessionStorage from "hooks/useSessionStorage";

export default function ExerciseSearchPage() {
    const [searchText, setSearchText] = useSessionStorage("ExerciseSearchPageText", "");
    const [exerciseType, setExerciseType] = useSessionStorage("ExerciseSearchPageType", "cardio");
    const [searchResults, setSearchResults] = useSessionStorage("ExerciseSearchPageResults", []);
    const [searchStatus, setSearchStatus] = useState(200);

    const fetchResults = () => {
        fetch(`${process.env.REACT_APP_GATEWAY_URI}/exercise/${exerciseType}/?search=${searchText}`)
            .then((res) => {
                setSearchStatus(res.status);
                return res.json();
            })
            .then((json) => setSearchResults(json));
    };
    const inputOnKeydown = (e) => {
        if (e.key === "Enter") {
            fetchResults();
            return;
        }
        return;
    };

    return (
        <div id="exercise-search-page-body">
            <div id="exercise-search-page-round-background-decoration"></div>
            <div id="exercise-search-page-bottom-top-banner-background-decoration"></div>
            <div id="exercise-search-page-bottom-bot-banner-background-decoration"></div>
            <div id="exercise-search-page-searchbox">
                <input
                    id="exercise-search-page-searchbox-input"
                    type="text"
                    placeholder="Search Exercise"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={inputOnKeydown}
                ></input>
                <button id="exercise-search-page-searchbox-button" onClick={fetchResults}>
                    <img src={magnifyingGlass} />
                </button>
            </div>
            <div id="exercise-search-page-choices">
                <button
                    id="exercise-search-page-choice-cardio"
                    className={`exercise-search-page-choice-button${exerciseType === "cardio" ? "-active" : ""}`}
                    onClick={() => setExerciseType("cardio")}
                >
                    Cardio
                </button>
                <button
                    id="exercise-search-page-choice-strength"
                    className={`exercise-search-page-choice-button${exerciseType === "strength" ? "-active" : ""}`}
                    onClick={() => setExerciseType("strength")}
                >
                    Strength
                </button>
            </div>
            <div id="exercise-search-island">
                <p id="exercise-search-island-number">{searchResults.length > 0 ? `Results: ${searchResults.length}` : null}</p>
                {searchResults.length > 0 ? <ExerciseSearchList searchResults={searchResults} /> : null}
                {searchStatus !== 200 ? <h3>Search came back empty! Consider refining your search.</h3> : null}
            </div>
        </div>
    );
}

function ExerciseSearchList(props) {
    let { searchResults } = props;
    return (
        <ul id="exercise-search-results-list">
            {searchResults.map((searchResults, index) => (
                <ExerciseSearchResult response={searchResults} key={`exercise-search-result-${index}`} />
            ))}
            <li id="exercise-search-refine-message">
                <h4>Didn't find what you were looking for? Consider refining your search!</h4>
            </li>
        </ul>
    );
}

function ExerciseSearchResult(props) {
    let { _id, name, MET } = props.response;

    const resultOnClick = () => {};
    return (
        <li className="exercise-search-result" onClick={resultOnClick}>
            <h4>{name}</h4>
            <p>MET: {MET}</p>
        </li>
    );
}

/* Utility Functions */
