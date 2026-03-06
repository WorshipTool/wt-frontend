'use client'

type Props = {
	size?: number
	'aria-label'?: string
}

export default function SheepAnimation({ size = 140, 'aria-label': ariaLabel }: Props) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 200 200"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-label={ariaLabel}
			data-testid="sheep-animation"
			style={{ overflow: 'visible' }}
		>
			<defs>
				<style>{`
					@keyframes sa-float {
						0%, 100% { transform: translateY(0px); }
						50%       { transform: translateY(-6px); }
					}
					@keyframes sa-shadow {
						0%, 100% { transform: scaleX(1);    opacity: 0.12; }
						50%       { transform: scaleX(0.88); opacity: 0.06; }
					}
					@keyframes sa-breathe {
						0%, 100% { transform: scale(1); }
						50%       { transform: scale(1.02); }
					}
					@keyframes sa-puff1 {
						0%, 100% { transform: scale(1) translate(0px, 0px); }
						50%       { transform: scale(1.025) translate(-0.5px, -1px); }
					}
					@keyframes sa-puff2 {
						0%, 100% { transform: scale(1) translate(0px, 0px); }
						50%       { transform: scale(1.015) translate(0.5px, -0.5px); }
					}
					@keyframes sa-puff3 {
						0%, 100% { transform: scale(1) translate(0px, 0px); }
						50%       { transform: scale(1.02) translate(0px, -1px); }
					}
					@keyframes sa-head-nod {
						0%, 100% { transform: translateY(0px)  rotate(0deg); }
						35%       { transform: translateY(-2px) rotate(-0.5deg); }
						70%       { transform: translateY(-3px) rotate(0.5deg); }
					}
					@keyframes sa-tail-wag {
						0%, 100% { transform: rotate(0deg);   }
						25%       { transform: rotate(20deg);  }
						75%       { transform: rotate(-20deg); }
					}
					@keyframes sa-leg-a {
						0%, 100% { transform: rotate(-3.5deg); }
						50%       { transform: rotate(3.5deg);  }
					}
					@keyframes sa-leg-b {
						0%, 100% { transform: rotate(3.5deg);  }
						50%       { transform: rotate(-3.5deg); }
					}
					@keyframes sa-ear-wiggle {
						0%, 76%, 100% { transform: rotate(0deg);   }
						80%           { transform: rotate(-24deg); }
						86%           { transform: rotate(9deg);   }
						91%           { transform: rotate(-15deg); }
						96%           { transform: rotate(5deg);   }
					}
					@keyframes sa-blink {
						0%, 87%, 100% { transform: scaleY(1);    }
						92%           { transform: scaleY(0.04); }
						95%           { transform: scaleY(1);    }
					}

					.sa-float-group {
						animation: sa-float 3.1s ease-in-out infinite;
					}
					.sa-shadow {
						animation: sa-shadow 3.1s ease-in-out infinite;
						transform-box: fill-box;
						transform-origin: center;
					}
					.sa-wool-body {
						animation: sa-breathe 2.9s ease-in-out infinite;
						transform-box: fill-box;
						transform-origin: center;
					}
					.sa-puff-tl {
						animation: sa-puff1 3.5s ease-in-out infinite;
						transform-box: fill-box;
						transform-origin: center;
					}
					.sa-puff-tr {
						animation: sa-puff2 3.2s ease-in-out infinite 0.5s;
						transform-box: fill-box;
						transform-origin: center;
					}
					.sa-puff-top {
						animation: sa-puff3 2.7s ease-in-out infinite 1s;
						transform-box: fill-box;
						transform-origin: center;
					}
					.sa-puff-bl {
						animation: sa-puff2 3.8s ease-in-out infinite 0.3s;
						transform-box: fill-box;
						transform-origin: center;
					}
					.sa-puff-br {
						animation: sa-puff1 3.4s ease-in-out infinite 0.7s;
						transform-box: fill-box;
						transform-origin: center;
					}
					.sa-head {
						animation: sa-head-nod 2.5s ease-in-out infinite;
						transform-box: fill-box;
						transform-origin: center;
					}
					.sa-tail {
						animation: sa-tail-wag 0.92s ease-in-out infinite;
						transform-box: fill-box;
						transform-origin: right center;
					}
					.sa-leg-bl {
						animation: sa-leg-b 2.1s ease-in-out infinite;
						transform-box: fill-box;
						transform-origin: top center;
					}
					.sa-leg-br {
						animation: sa-leg-a 2.1s ease-in-out infinite 0.4s;
						transform-box: fill-box;
						transform-origin: top center;
					}
					.sa-leg-fl {
						animation: sa-leg-a 2.0s ease-in-out infinite 0.2s;
						transform-box: fill-box;
						transform-origin: top center;
					}
					.sa-leg-fr {
						animation: sa-leg-b 2.0s ease-in-out infinite 0.6s;
						transform-box: fill-box;
						transform-origin: top center;
					}
					.sa-ear-l {
						animation: sa-ear-wiggle 6.0s ease-in-out infinite 1.2s;
						transform-box: fill-box;
						transform-origin: bottom center;
					}
					.sa-ear-r {
						animation: sa-ear-wiggle 6.0s ease-in-out infinite 2.8s;
						transform-box: fill-box;
						transform-origin: bottom center;
					}
					.sa-eye {
						animation: sa-blink 4.8s ease-in-out infinite 0.8s;
						transform-box: fill-box;
						transform-origin: center;
					}
				`}</style>
			</defs>

			{/* Ground shadow — stays put while sheep floats */}
			<ellipse
				className="sa-shadow"
				cx="95"
				cy="174"
				rx="54"
				ry="7"
				fill="#000"
			/>

			{/* Everything inside the float group rises & falls together */}
			<g className="sa-float-group">

				{/* Tail — pivots from its body-attachment (right edge) */}
				<g className="sa-tail">
					<circle cx="48" cy="108" r="14" fill="white" stroke="#D0D0D0" strokeWidth="1.5"/>
				</g>

				{/* Back legs (behind body) */}
				<g className="sa-leg-bl">
					<rect x="63" y="133" width="11" height="34" rx="5.5" fill="#6B6560"/>
				</g>
				<g className="sa-leg-br">
					<rect x="79" y="133" width="11" height="34" rx="5.5" fill="#6B6560"/>
				</g>

				{/* Front legs */}
				<g className="sa-leg-fl">
					<rect x="100" y="133" width="11" height="36" rx="5.5" fill="#58534E"/>
				</g>
				<g className="sa-leg-fr">
					<rect x="116" y="133" width="11" height="36" rx="5.5" fill="#58534E"/>
				</g>

				{/* ── Wool body ────────────────────────── */}
				{/* Lower puffs (drawn first so main body covers their edges) */}
				<g className="sa-puff-bl">
					<circle cx="68" cy="119" r="22" fill="white" stroke="#D0D0D0" strokeWidth="1.5"/>
				</g>
				<g className="sa-puff-br">
					<circle cx="111" cy="121" r="21" fill="white" stroke="#D0D0D0" strokeWidth="1.5"/>
				</g>
				{/* Main body ellipse */}
				<g className="sa-wool-body">
					<ellipse cx="88" cy="104" rx="46" ry="38" fill="white" stroke="#D0D0D0" strokeWidth="1.5"/>
				</g>
				{/* Upper side puffs */}
				<g className="sa-puff-tl">
					<circle cx="62" cy="88" r="29" fill="white" stroke="#D0D0D0" strokeWidth="1.5"/>
				</g>
				<g className="sa-puff-tr">
					<circle cx="114" cy="83" r="26" fill="white" stroke="#D0D0D0" strokeWidth="1.5"/>
				</g>
				{/* Top puff */}
				<g className="sa-puff-top">
					<circle cx="89" cy="70" r="23" fill="white" stroke="#D0D0D0" strokeWidth="1.5"/>
				</g>

				{/* ── Head ─────────────────────────────── */}
				<g className="sa-head">
					{/* Ears — pivot from their bottom (head attachment) */}
					<g className="sa-ear-l">
						<ellipse cx="140" cy="68" rx="8" ry="13" transform="rotate(-20 140 68)" fill="#C4A87A" stroke="#A88855" strokeWidth="1.5"/>
						<ellipse cx="140" cy="69" rx="4" ry="7"  transform="rotate(-20 140 69)" fill="#E8C8A0"/>
					</g>
					<g className="sa-ear-r">
						<ellipse cx="162" cy="66" rx="8" ry="13" transform="rotate(15 162 66)" fill="#C4A87A" stroke="#A88855" strokeWidth="1.5"/>
						<ellipse cx="162" cy="67" rx="4" ry="7"  transform="rotate(15 162 67)" fill="#E8C8A0"/>
					</g>

					{/* Head shape */}
					<ellipse cx="150" cy="90" rx="25" ry="21" fill="#C4A87A" stroke="#A88855" strokeWidth="1.5"/>

					{/* Brow highlight */}
					<ellipse cx="155" cy="83" rx="7" ry="5" fill="#D4B888" opacity="0.5"/>

					{/* Eye (with blink) */}
					<g className="sa-eye">
						<circle cx="157" cy="84" r="4.5" fill="#1A1A1A"/>
						<circle cx="158.5" cy="82.5" r="1.5" fill="white"/>
					</g>

					{/* Muzzle */}
					<ellipse cx="162" cy="97" rx="9" ry="7" fill="#D4A07A" stroke="#A88855" strokeWidth="1"/>
					{/* Nostrils */}
					<circle cx="159.5" cy="96.5" r="2"   fill="#8B5535"/>
					<circle cx="164.5" cy="96.5" r="2"   fill="#8B5535"/>
					{/* Smile */}
					<path
						d="M156 101 Q162 105 168 101"
						stroke="#8B5535"
						strokeWidth="1.5"
						strokeLinecap="round"
						fill="none"
					/>
				</g>
			</g>
		</svg>
	)
}
