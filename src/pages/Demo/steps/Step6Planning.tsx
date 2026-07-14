import { motion } from 'framer-motion';
import { DEMO_TIMELINE, AUDIT_TIMELINE } from '../../../data/mockDemoData';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { DemoType } from '../DemoFlow';

interface Props {
  onNext: () => void;
  demoType: DemoType;
}

export function Step6Planning({ onNext, demoType }: Props) {
  const isNetwork = demoType === 'network';
  const timeline = isNetwork ? DEMO_TIMELINE : AUDIT_TIMELINE;

  return (
    <div className="w-full max-w-4xl h-full flex flex-col pt-12 pb-24 overflow-y-auto custom-scrollbar">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center"
      >
        <h2 className="text-3xl font-bold mb-4">
          {isNetwork ? 'Votre Programme' : 'Roadmap d\'Audit Flash'}
        </h2>
        <p className="text-neutral-400 max-w-2xl mx-auto">
          {isNetwork 
            ? 'Un agenda de travail optimisé pour rentabiliser votre séjour et atteindre vos objectifs professionnels.' 
            : 'Un plan d\'action sur 5 jours pour analyser, modéliser et proposer une intégration IA pragmatique.'}
        </p>
      </motion.div>

      <div className="space-y-12">
        {timeline.map((day, dayIndex) => (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: dayIndex * 0.2 }}
            className="relative"
          >
            <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 py-4 flex items-center gap-4 mb-6">
              <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-full font-bold text-sm">
                {day.day}
              </div>
              <h3 className="text-xl font-semibold text-white">{day.title}</h3>
            </div>

            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-800 before:to-transparent">
              {day.events.map((event, eventIndex) => (
                <motion.div
                  key={eventIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: dayIndex * 0.2 + eventIndex * 0.1 }}
                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-black bg-neutral-800 text-neutral-500 group-[.is-active]:text-indigo-500 group-[.is-active]:bg-indigo-500/20 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-[0_0_0_4px_#000]">
                    <Clock size={16} />
                  </div>

                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-indigo-400 font-semibold">{event.time}</span>
                      <span className="text-xs font-medium px-2 py-1 rounded-md bg-neutral-800 text-neutral-300">
                        {event.type}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-300 leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-16 flex justify-center sticky bottom-0 py-4 bg-gradient-to-t from-black via-black to-transparent z-20"
      >
        <button
          onClick={onNext}
          className="group flex items-center gap-2 rounded-full bg-indigo-500 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-indigo-400"
        >
          {isNetwork ? 'Valider le programme' : 'Valider la mission'}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </motion.div>
    </div>
  );
}
