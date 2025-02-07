import styles from "../secondaryModal.module.scss";


type Props = {
  setActiveModal: (arg0: number) => void;
};


const SourcesInfo = ({ setActiveModal }: Props) => {


  return (
      <div className={styles.clearWrapper} onClick={()=> setActiveModal(0)}>
        <div className={styles.modalTwo} onClick={e => e.stopPropagation()}>
          <div>
            <h4>What does Veracity consider a source?</h4>
            <p>Veracity considers a source to be any origin of information that supports a claim. This includes news outlets, research papers, government reports, expert opinions, or documented content providing facts or insights.</p>
            <h4>How does Veracity curate the sources?</h4>
            <p>Veracity curates sources by evaluating their trustworthiness through key criteria: reputation, transparency, accuracy, and bias. It considers the source’s track record, whether it cites verifiable evidence, and how consistently it presents factual information. This careful curation ensures that only reliable sources are used for scoring claims.</p>
          
          </div>
        </div>
      </div>
  );
}

export default SourcesInfo;