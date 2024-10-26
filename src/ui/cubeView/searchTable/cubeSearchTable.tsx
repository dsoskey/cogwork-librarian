import React, { useContext, useMemo, useRef, useState } from 'react'
import { CubeViewModelContext, OrderedCard } from '../useCubeViewModel'
import { Card, normCardList, QueryRunner } from 'mtgql'
import { COGDB_FILTER_PROVIDER } from '../../../api/local/db'
import { ColorBreakdown } from '../cubeTags'
import { useHighlightPrism } from '../../../api/local/syntaxHighlighting'
import _cloneDeep from 'lodash/cloneDeep'
import { useMultiInputEditor } from '../../hooks/useMultiInputEditor'
import _groupBy from 'lodash/groupBy'
import { useLocalStorage } from '../../../api/local/useLocalStorage'
import { CardResultsLayout } from '../cardResults'
import { InfoModal } from '../../component/infoModal'
import { ColorBreakdownRow, CubeSearchRow, ShownQuery } from './row'
import { DEFAULT_QUERIES, TABLE_PRESETS } from './presets'
import { Setter } from '../../../types'
import { Modal } from '../../component/modal'
import { isFunction } from 'lodash'
import { getColors } from './tempColorUtil'
export interface CubeSearchTableProps {}

function colorBreakdown(cards: Card[], tag: string) {
    return cards.reduce((acc, card) => {
        let key: string;
        let colors = getColors(card)
        if (colors.length === 0) {
            key = "c";
        } else if (colors.length > 1) {
            key = "m";
        } else {
            key = colors[0].toLowerCase()
        }
        acc[key]++;
        acc.total++;
        return acc
    }, { tag, w: 0, u: 0, b: 0, r: 0, g: 0, m: 0, c: 0, total: 0 });
}

export function CubeSearchTable({}: CubeSearchTableProps) {
    // optimization: make this a range to check rather than flopping all rows on a line split
    const [flop, setFlop] = useState(false);
    const { cards, cube } = useContext(CubeViewModelContext);
    const cardCount = useMemo(() => _groupBy(cards, "oracle_id"),[cards]);

    const [showPercentage, setShowPercentage] = useLocalStorage("show-percentage",true);
    const [cardsToShow, _setCardsToShow] = useState<ShownQuery>({
        query: "",
        cards: [],
    });
    const setCardsToShow = (p) => {
        _setCardsToShow(p);
        setTimeout(() => {
            topOfResults.current?.scrollIntoView({
                block: "start",
                inline: "nearest",
                behavior: "smooth"
            })
        }, 200)
    }
    useHighlightPrism([cardsToShow])

    const [queries, setQueries] = useLocalStorage(`cube-table-queries-${cube.key}`, DEFAULT_QUERIES);
    const setQuery = (index: number, nextQuery: string) => {
        setQueries((prev) => {
            const next = _cloneDeep(prev);
            next[index] = nextQuery;
            return next;
        })
    }
    const bulkSetQuery: Setter<string[]> = (next) => {
        setQueries(next)
        setFlop(p=>!p)
        close();
    }

    const searchCards = useMemo(() =>
      QueryRunner.generateSearchFunction(normCardList(cards), COGDB_FILTER_PROVIDER),
      [cards]
    )


    const totalbucket: ColorBreakdown = colorBreakdown(cards ?? [],"_total_");
    const editorContainer = useRef<HTMLTableSectionElement>(null)
    const topOfResults = useRef<HTMLHeadingElement>(null)

    const onKeyDown = useMultiInputEditor({
        container: editorContainer,
        className: 'search-row-input',
        numInputs: queries.length,
        onEnter(focus, index, splitIndex) {
            const firstHalf = queries[index].substring(0, splitIndex);
            const secondHalf = queries[index].substring(splitIndex);
            setQueries(prev => {
                const next = _cloneDeep(prev);
                next.splice(index, 1, firstHalf, secondHalf)
                return next;
            })

            setTimeout(() => {
                focus(index, false, 0);
                setFlop(p=>!p);
            }, 50);
        },
        onBackspace(focus, index) {
            const prevEntry = queries[index - 1];
            setQueries(prev => {
                const next = _cloneDeep(prev);
                next.splice(index, 1);
                next[index-1] = next[index-1] + queries[index]
                return next;
            })
            setTimeout(() => {
                focus(index, true, prevEntry.length)
                setFlop(p=>!p);
            }, 50);
        },
        onDelete(_focusEntry, index) {
            setQueries(prev => {
                const next = _cloneDeep(prev);
                const nextQuery = prev[index + 1];
                next[index] = queries[index] + nextQuery
                next.splice(index + 1, 1);
                return next;
            })
            setFlop(p=>!p);
            // No focus, we're already on the correct line
        }
    });

    const onCellClick = (colorKey: string) => {
        if (colorKey === "total") {
            setCardsToShow({ query: "all cards", cards });
        } else {
            setCardsToShow({
                query: `c=${colorKey}`,
                cards: cards.filter(it => {
                    // todo: use color filter
                    const colors = getColors(it)
                    switch (colorKey) {
                        case "c":
                            return colors.length === 0;
                        case "m":
                            return colors.length >=2;
                        default:
                            return colors.length === 1 && colors[0].toLowerCase() === colorKey;
                    }
                })
            });
        }
    }

    return <div className="cube-search-table-root">
        <div className="table-controls">
            <InfoModal
              title={<h2>Cube search table</h2>}
              info={<p>
                  Each row has an editable search query and the query results broken down by color category.
                  Click a table cell to show the cards that match that cell's query.
                  Edit the query rows like any multiline text box,
                  using <code>Enter</code> and <code>Backspace</code> to add and remove rows.
                  Navigate the query rows using <code>Up</code> and <code>Down</code>.
              </p>}
            />
            <PresetSelector setQueries={bulkSetQuery} cards={cards} />
            <label className='row center'>
                <input
                  type='checkbox' className='custom'
                  checked={showPercentage}
                  onChange={() => setShowPercentage(p => !p)}
                />
                <span>show percentages</span>
            </label>
        </div>
        <table className="cube-search-table">
            <thead>
            <tr>
                <th>query</th>
                <th>total</th>
                <th className='w'>w</th>
                <th className='u'>u</th>
                <th className='b'>b</th>
                <th className='r'>r</th>
                <th className='g'>g</th>
                <th className='m'>m</th>
                <th className='c'>c</th>
            </tr>
            </thead>
            <tbody ref={editorContainer}>
            <ColorBreakdownRow
              onCellClick={onCellClick}
              breakdown={totalbucket}
              total={totalbucket.total}
              showPercentages={showPercentage}
            >
                total
            </ColorBreakdownRow>
            {queries.map(((it, i) => (
              <CubeSearchRow
                setCardsToShow={setCardsToShow}
                flop={flop}
                key={i}
                query={it}
                setQuery={(it) => setQuery(i, it)}
                searchCards={searchCards}
                total={totalbucket.total}
                cardCounts={cardCount}
                onKeyDown={onKeyDown(i)}
                showPercentages={showPercentage}
              />
            )))}
            </tbody>
        </table>
        {cardsToShow.cards.length > 0 && <CardResultsLayout
          cards={() => cardsToShow.cards}
          filterControl={<h3 ref={topOfResults}>
              <code className='language-scryfall-extended-multi'>
                  {cardsToShow.query}
              </code>
            </h3>}
        />}
    </div>;
}

interface PresetSelectorProps {
    setQueries: Setter<string[]>;
    cards: OrderedCard[]
}

function PresetSelector({ setQueries, cards }: PresetSelectorProps) {
    const [open, setOpen] = useState<boolean>(false);
    const [selected, setSelected] = useState<number>(-1);
    const handleClick = () => {
        if (selected === -1) return;

        const preset: string[] = isFunction(TABLE_PRESETS[selected].preset)
            // @ts-ignore
            ? TABLE_PRESETS[selected].preset(cards)
            : TABLE_PRESETS[selected].preset;
        setQueries(preset);
        setOpen(false);
    }
    return <span>
        <button onClick={() => setOpen(true)}>table presets</button>
        <Modal title={<h2>Presets</h2>} open={open} onClose={() => setOpen(false)}>
            <p></p>
            <table>
                <thead><tr>
                    <th></th>
                    <th>Preset name</th>
                    <th>Description</th>
                </tr></thead>
                <tbody>
                {TABLE_PRESETS.map((preset, index) =>
                  <tr key={preset.name + index}>
                      <td><input type="radio" checked={selected === index} onChange={() => setSelected(index)} /></td>
                      <td>{preset.name}</td>
                      <td>{preset.description ?? "~"}</td>
                  </tr>)}
                </tbody>
            </table>
            <button disabled={selected === -1} onClick={handleClick}>use preset</button>
        </Modal>
    </span>;
}